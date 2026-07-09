#!/usr/bin/env node
/**
 * Genera PDFs profesionales desde los Markdown de Documentos técnicos.
 * - Renderiza diagramas Mermaid a SVG
 * - Encabezado con logo UAI + pie de página
 * - PDFs individuales + documento completo
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, "..");
const PDF_DIR = path.resolve(DOCS_DIR, "PDFs");
const ASSETS_DIR = path.resolve(DOCS_DIR, "assets");
const TMP_DIR = path.resolve(__dirname, ".tmp");
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const UAI_COLOR = "#632634";

const DOCUMENTS = [
  { src: "README.md", out: "00-Indice-y-Caratula.pdf", title: "Índice y Carátula" },
  { src: "01-problema-y-tematica.md", out: "01-Problema-y-Tematica.pdf", title: "Problema y Temática" },
  { src: "02-requerimientos.md", out: "02-Requerimientos.pdf", title: "Requerimientos" },
  { src: "03-casos-de-uso.md", out: "03-Casos-de-Uso.pdf", title: "Casos de Uso" },
  { src: "04-arquitectura.md", out: "04-Arquitectura.pdf", title: "Arquitectura" },
  { src: "05-base-de-datos.md", out: "05-Base-de-Datos.pdf", title: "Base de Datos" },
  { src: "06-apis.md", out: "06-APIs.pdf", title: "APIs" },
  { src: "07-frontend.md", out: "07-Frontend.pdf", title: "Frontend" },
  { src: "08-calidad-y-normativa.md", out: "08-Calidad-y-Normativa.pdf", title: "Calidad y Normativa" },
  { src: "09-chatbot-ia.md", out: "09-Chatbot-IA.pdf", title: "Chatbot con IA" },
  { src: "10-backup-y-recuperacion.md", out: "10-Backup-y-Recuperacion.pdf", title: "Backup y Recuperación" },
  { src: "11-ejecucion.md", out: "11-Ejecucion.pdf", title: "Ejecución del Proyecto" },
];

const PPTR_CONFIG = path.join(TMP_DIR, "pptr.json");

marked.setOptions({
  gfm: true,
  breaks: false,
});

async function ensureDirs() {
  await fs.mkdir(PDF_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.writeFile(
    PPTR_CONFIG,
    JSON.stringify({ args: ["--no-sandbox", "--disable-setuid-sandbox"] })
  );
}

async function loadLogoBase64() {
  const logoPath = path.join(ASSETS_DIR, "uai-logo-horizontal.png");
  const buf = await fs.readFile(logoPath);
  return buf.toString("base64");
}

async function loadStackedLogoBase64() {
  const logoPath = path.join(ASSETS_DIR, "uai-logo-stacked.png");
  const buf = await fs.readFile(logoPath);
  return buf.toString("base64");
}

async function renderMermaidBlock(code, outPath) {
  const mmdPath = `${outPath}.mmd`;
  const svgPath = `${outPath}.svg`;
  await fs.writeFile(mmdPath, code, "utf8");
  try {
    execSync(
      `npx --yes @mermaid-js/mermaid-cli@11.4.1 -p "${PPTR_CONFIG}" -i "${mmdPath}" -o "${svgPath}" -b transparent -w 1200`,
      { stdio: "pipe", cwd: __dirname, timeout: 120000 }
    );
    return await fs.readFile(svgPath, "utf8");
  } catch (err) {
    console.warn(`  ⚠ Mermaid falló, usando bloque de código: ${path.basename(outPath)}`);
    return null;
  }
}

async function processMermaid(md, fileId) {
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let result = md;
  let index = 0;
  const matches = [...md.matchAll(regex)];

  for (const match of matches) {
    const code = match[1].trim();
    const outBase = path.join(TMP_DIR, `${fileId}-${index}`);
    const svg = await renderMermaidBlock(code, outBase);

    let replacement;
    if (svg) {
      const b64 = Buffer.from(svg).toString("base64");
      replacement = `<div class="diagram"><img src="data:image/svg+xml;base64,${b64}" alt="Diagrama" /></div>`;
    } else {
      replacement = `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    }

    result = result.replace(match[0], replacement);
    index++;
  }

  return result;
}

function preprocessMarkdown(md, fileId) {
  let result = md;

  // Casos de uso: cada CU en página aparte
  if (fileId === "03-casos-de-uso") {
    result = result.replace(
      /\n---\n\n(## CU-\d+)/g,
      "\n---\n\n<div class=\"page-break\"></div>\n\n$1"
    );
  }

  return result;
}

async function scaleDiagramsToFitPage(page) {
  // Área útil A4 con encabezado/pie (~600px de alto, ~520px de ancho útil)
  const MAX_HEIGHT = 580;
  const MAX_WIDTH = 520;

  await page.evaluate(
    ({ maxH, maxW }) => {
      document.querySelectorAll(".diagram img").forEach((img) => {
        const nh = img.naturalHeight || img.height;
        const nw = img.naturalWidth || img.width;
        if (!nh || !nw) return;

        const scale = Math.min(1, maxH / nh, maxW / nw);
        if (scale < 1) {
          img.style.width = `${Math.round(nw * scale)}px`;
          img.style.height = `${Math.round(nh * scale)}px`;
        }
        img.style.maxWidth = "100%";
        img.style.maxHeight = `${maxH}px`;
        img.style.objectFit = "contain";
      });
    },
    { maxH: MAX_HEIGHT, maxW: MAX_WIDTH }
  );
}

async function waitForImages(page) {
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
      )
    )
  );
}

function cleanMarkdownForPdf(md) {
  // Quitar líneas de navegación al final
  return md
    .replace(/\n---\n\n\[←[^\]]*\][^\n]*\n?/g, "\n")
    .replace(/\n\[←[^\]]*\][^\n]*·[^\n]*\n?/g, "\n")
    .replace(/\[← Volver al índice\]\(README\.md\)/g, "")
    .replace(/\[← Anterior:[^\]]*\]\([^)]*\)\s*·\s*\[Volver al índice\]\(README\.md\)\s*·\s*\[Siguiente:[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[← Anterior:[^\]]*\]\([^)]*\)\s*·\s*\[Volver al índice\]\(README\.md\)/g, "")
    .replace(/\[← Volver al índice\]\(README\.md\)\s*·\s*\[Siguiente:[^\]]*\]\([^)]*\)/g, "");
}

async function markdownToHtml(md, fileId) {
  const preprocessed = preprocessMarkdown(md, fileId);
  const cleaned = cleanMarkdownForPdf(preprocessed);
  const withDiagrams = await processMermaid(cleaned, fileId);
  const bodyHtml = marked.parse(withDiagrams);
  return bodyHtml;
}

function buildCoverPage(stackedLogoB64) {
  return `
    <div class="cover-page">
      <img class="logo" src="data:image/png;base64,${stackedLogoB64}" alt="Universidad Abierta Interamericana" />
      <h1>VentaGamer</h1>
      <p class="subtitle">Plataforma web de venta de productos gaming</p>
      <p class="subtitle" style="font-size:12pt; margin-top:-8mm;">Documentación Técnica — Trabajo Práctico Integrador</p>
      <div class="meta">
        <p><strong>Universidad:</strong> Universidad Abierta Interamericana (UAI)</p>
        <p><strong>Materia:</strong> Desarrollo y Arquitecturas Web</p>
        <p><strong>Profesor:</strong> Escandell Gustavo Emanuel</p>
        <p><strong>Integrantes:</strong><br/>
          &nbsp;&nbsp;Fazzari, Franco Tomás<br/>
          &nbsp;&nbsp;Mastromarino, Nicolás<br/>
          &nbsp;&nbsp;Reser, Iván Leonel</p>
        <p><strong>Fecha de entrega:</strong> 09/07/2026</p>
      </div>
    </div>
  `;
}

function wrapHtml(bodyHtml, css, { includeCover = false, stackedLogoB64 = "" } = {}) {
  const cover = includeCover ? buildCoverPage(stackedLogoB64) : "";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>
<body>
  ${cover}
  <div class="content">${bodyHtml}</div>
</body>
</html>`;
}

function buildHeaderTemplate(logoB64, docTitle) {
  return `
    <div style="width:100%; font-size:8px; font-family:Arial,sans-serif; padding:8px 36px 6px; display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid ${UAI_COLOR}; margin:0;">
      <img src="data:image/png;base64,${logoB64}" style="height:26px; width:auto;" />
      <span style="color:${UAI_COLOR}; font-weight:600; font-size:9px; letter-spacing:0.3px;">VentaGamer · ${docTitle}</span>
    </div>
  `;
}

function buildFooterTemplate() {
  return `
    <div style="width:100%; font-size:7.5px; font-family:Arial,sans-serif; color:#666; padding:4px 36px 0; display:flex; justify-content:space-between; border-top:1px solid #ddd;">
      <span>UAI · Desarrollo y Arquitecturas Web · TP Integrador · 09/07/2026</span>
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  `;
}

async function htmlToPdf(browser, html, outPath, { logoB64, title }) {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120000 });
  await waitForImages(page);
  await scaleDiagramsToFitPage(page);

  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: buildHeaderTemplate(logoB64, title),
    footerTemplate: buildFooterTemplate(),
    margin: { top: "72px", bottom: "60px", left: "0", right: "0" },
    preferCSSPageSize: false,
  });

  await page.close();
  console.log(`  ✓ ${path.basename(outPath)}`);
}

async function main() {
  console.log("═".repeat(50));
  console.log(" Generando PDFs — VentaGamer Documentación Técnica");
  console.log("═".repeat(50));

  await ensureDirs();

  const css = await fs.readFile(path.join(__dirname, "pdf-styles.css"), "utf8");
  const logoB64 = await loadLogoBase64();
  const stackedLogoB64 = await loadStackedLogoBase64();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const allBodies = [];

  for (const doc of DOCUMENTS) {
    const mdPath = path.join(DOCS_DIR, doc.src);
    const md = await fs.readFile(mdPath, "utf8");
    const fileId = path.basename(doc.src, ".md");

    console.log(`\n→ ${doc.title}`);

    const bodyHtml = await markdownToHtml(md, fileId);
    const isReadme = doc.src === "README.md";

    const html = wrapHtml(bodyHtml, css, {
      includeCover: isReadme,
      stackedLogoB64,
    });

    const outPath = path.join(PDF_DIR, doc.out);
    await htmlToPdf(browser, html, outPath, { logoB64, title: doc.title });

    allBodies.push(`<div class="doc-break"><h1 style="margin-top:0">${doc.title}</h1>${bodyHtml}</div>`);
  }

  // PDF completo combinado
  console.log("\n→ Documento completo (todos los capítulos)");
  const combinedHtml = wrapHtml(
    buildCoverPage(stackedLogoB64) + allBodies.join("\n"),
    css
  );
  await htmlToPdf(browser, combinedHtml, path.join(PDF_DIR, "VentaGamer-Documentacion-Completa.pdf"), {
    logoB64,
    title: "Documentación Completa",
  });

  await browser.close();

  // Limpiar temporales
  try {
    const tmpFiles = await fs.readdir(TMP_DIR);
    for (const f of tmpFiles) {
      await fs.unlink(path.join(TMP_DIR, f)).catch(() => {});
    }
  } catch {}

  console.log("\n" + "═".repeat(50));
  console.log(` Listo. PDFs en: ${PDF_DIR}`);
  console.log("═".repeat(50));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
