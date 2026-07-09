"""Genera el PDF del Plan de Modernizacion."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUT = "/Users/ivanleonelreser/Downloads/Venta_Gamer---Proyecto-ARQWEB-master/modernizacion/docs/Plan_Modernizacion.pdf"

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title="Plan de Modernizacion - Venta Gamer",
    author="Equipo Venta Gamer",
)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="H1Custom", parent=styles["Heading1"],
    fontSize=20, textColor=colors.HexColor("#1e3a8a"),
    spaceAfter=14, spaceBefore=10,
))
styles.add(ParagraphStyle(
    name="H2Custom", parent=styles["Heading2"],
    fontSize=14, textColor=colors.HexColor("#1e40af"),
    spaceAfter=8, spaceBefore=14,
))
styles.add(ParagraphStyle(
    name="H3Custom", parent=styles["Heading3"],
    fontSize=11, textColor=colors.HexColor("#0f172a"),
    spaceAfter=4, spaceBefore=8,
))
styles.add(ParagraphStyle(
    name="BodyJ", parent=styles["BodyText"],
    alignment=TA_JUSTIFY, fontSize=10, leading=14,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="CodeBlock", parent=styles["BodyText"],
    fontName="Courier", fontSize=9, leading=12,
    leftIndent=10, textColor=colors.HexColor("#1e293b"),
    backColor=colors.HexColor("#f1f5f9"),
    borderPadding=4, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Cover", parent=styles["Title"],
    fontSize=28, textColor=colors.HexColor("#1e3a8a"),
    alignment=TA_CENTER, spaceAfter=20,
))
styles.add(ParagraphStyle(
    name="Subtitle", parent=styles["Normal"],
    fontSize=14, textColor=colors.HexColor("#475569"),
    alignment=TA_CENTER, spaceAfter=10,
))

story = []

# ========== PORTADA ==========
story.append(Spacer(1, 4*cm))
story.append(Paragraph("Plan de Modernizacion", styles["Cover"]))
story.append(Paragraph("Venta Gamer - Proyecto ARQWEB", styles["Subtitle"]))
story.append(Spacer(1, 1*cm))
story.append(Paragraph(
    "Migracion de ASP.NET WebForms (.NET Framework 4.8)<br/>"
    "a ASP.NET Core 8 Web API + React 18 + TypeScript",
    styles["Subtitle"]
))
story.append(Spacer(1, 3*cm))

cover_table = Table([
    ["Stack actual", "ASP.NET WebForms / .NET Framework 4.8 / SQL Server / ADO.NET"],
    ["Stack objetivo", ".NET 8 LTS / EF Core 8 / Identity+JWT / React 18 + Vite + TS"],
    ["Plataforma dev", "macOS (Apple Silicon o Intel) - cross-platform"],
    ["Arquitectura", "Clean Architecture (4 capas) + monorepo"],
    ["Base de datos", "SQL Server 2022 en Docker"],
    ["Etapas totales", "10 (de 0 a 9), cada una testeable end-to-end"],
], colWidths=[4.5*cm, 11*cm])
cover_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#1e3a8a")),
    ("TEXTCOLOR", (0,0), (0,-1), colors.white),
    ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
    ("FONTNAME", (1,0), (1,-1), "Helvetica"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
]))
story.append(cover_table)
story.append(PageBreak())

# ========== 1. CONTEXTO ==========
story.append(Paragraph("1. Contexto y diagnostico", styles["H1Custom"]))

story.append(Paragraph("1.1 Estado actual", styles["H2Custom"]))
story.append(Paragraph(
    "El proyecto Venta Gamer es una aplicacion web desarrollada con ASP.NET WebForms "
    "sobre .NET Framework 4.8, organizada en 7 proyectos siguiendo arquitectura N-Tier "
    "clasica (BE / BLL / DAL / GUI / SECURITY / Services / Interfaces). Implementa "
    "patrones Composite (Role/Permission), Observer (multi-idioma) y un sistema "
    "propietario de Digitos Verificadores (DVH/DVV) para integridad.",
    styles["BodyJ"]
))

story.append(Paragraph("1.2 Inventario detectado", styles["H2Custom"]))
inv_data = [
    ["Capa", "Componentes"],
    ["Entidades (BE)", "8 clases: Productos, Usuario, RegistroBitacora, DetalleCompra, Idioma, Role, Permission, BackupFileInfo"],
    ["Logica (BLL)", "5 servicios: Bitacora, GestionDb, GestionIdioma, Perfil, Productos"],
    ["DAL", "9 clases con ADO.NET puro + 4 stored procedures"],
    ["BD", "9 tablas + tablas DVH dinamicas"],
    ["UI WebForms", "14 paginas .aspx + MasterPage + 1 Web Service ASMX"],
    ["Seguridad", "LoginManager, SessionManager, CryptoManager (SHA256), DVManager"],
    ["Roles", "Admin, User, WebMaster, Tester (con jerarquia)"],
]
inv_table = Table(inv_data, colWidths=[3.5*cm, 13*cm])
inv_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
]))
story.append(inv_table)

story.append(Paragraph("1.3 Deuda tecnica y vulnerabilidades", styles["H2Custom"]))
debt = [
    "<b>Hashing inseguro:</b> SHA256 sin salt en CryptoManager. Vulnerable a rainbow tables.",
    "<b>Sesiones en memoria estatica:</b> SessionManager no escala, no soporta multi-instancia.",
    "<b>Pregunta de seguridad hardcodeada:</b> 'Cual es su profesor favorito?' = 'Sabato' en PasswordReset.",
    "<b>Connection string en codigo fuente:</b> credenciales en _connection.cs (SA password expuesta).",
    "<b>Carrito en Session:</b> se pierde con el navegador, no auditable.",
    "<b>Compras en XML:</b> Ventas.xml en disco, no transaccional, no consultable.",
    "<b>Sin tests:</b> 0 cobertura automatizada.",
    "<b>Solo Windows:</b> WebForms no corre en Mac/Linux.",
]
for d in debt:
    story.append(Paragraph(f"&bull; {d}", styles["BodyJ"]))

story.append(PageBreak())

# ========== 2. STACK OBJETIVO ==========
story.append(Paragraph("2. Stack tecnologico objetivo", styles["H1Custom"]))

story.append(Paragraph("2.1 Backend", styles["H2Custom"]))
backend_stack = [
    [".NET 8 LTS", "Soporte hasta noviembre 2026, ARM nativo en Mac"],
    ["ASP.NET Core Web API", "REST stateless, Swagger/OpenAPI integrado"],
    ["Entity Framework Core 8", "ORM con migrations, code-first, query LINQ"],
    ["ASP.NET Core Identity", "Reemplaza CryptoManager+LoginManager, hashing PBKDF2"],
    ["JWT Bearer", "Reemplaza SessionManager, stateless"],
    ["FluentValidation", "Validacion declarativa de DTOs"],
    ["Serilog", "Logging estructurado (reemplaza Bitacora ad-hoc)"],
    ["QuestPDF", "Generacion de PDF moderna (reemplaza iTextSharp)"],
    ["Mapster", "Mapeo DTO <-> Entity rapido"],
    ["xUnit + Moq", "Testing unitario e integracion"],
]
bt = Table([["Tecnologia", "Proposito"]] + backend_stack, colWidths=[5*cm, 11.5*cm])
bt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(bt)

story.append(Paragraph("2.2 Frontend", styles["H2Custom"]))
frontend_stack = [
    ["Vite + React 18 + TypeScript", "Bundler ultra rapido, type safety"],
    ["React Router 6", "Routing declarativo con loaders"],
    ["TanStack Query (React Query)", "Server state, cache, refetching automatico"],
    ["Zustand", "Client state ligero (auth, UI)"],
    ["Axios", "Cliente HTTP con interceptors para JWT refresh"],
    ["React Hook Form + Zod", "Formularios performantes con validacion typesafe"],
    ["Tailwind CSS + shadcn/ui", "Estilos utility-first + componentes accesibles"],
    ["i18next", "Internacionalizacion (reemplaza Observer de idioma)"],
    ["Vitest + Testing Library", "Tests unitarios"],
    ["Playwright", "Tests end-to-end"],
]
ft = Table([["Tecnologia", "Proposito"]] + frontend_stack, colWidths=[5*cm, 11.5*cm])
ft.setStyle(bt._cellStyles and TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(ft)

story.append(Paragraph("2.3 Infraestructura", styles["H2Custom"]))
infra_stack = [
    ["Docker Compose", "Orquestacion local (SQL + backend + frontend)"],
    ["SQL Server 2022", "BD relacional, ARM nativo en Apple Silicon"],
    ["GitHub Actions (futuro)", "CI/CD automatizado"],
]
it = Table([["Tecnologia", "Proposito"]] + infra_stack, colWidths=[5*cm, 11.5*cm])
it.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(it)

story.append(PageBreak())

# ========== 3. ARQUITECTURA ==========
story.append(Paragraph("3. Arquitectura objetivo", styles["H1Custom"]))

story.append(Paragraph("3.1 Clean Architecture - 4 capas", styles["H2Custom"]))
story.append(Paragraph(
    "Adoptamos Clean Architecture para separar responsabilidades y maximizar testabilidad. "
    "La regla de dependencias: capas externas conocen las internas, nunca al reves.",
    styles["BodyJ"]
))

ca_data = [
    ["Capa", "Contiene", "Depende de"],
    ["Domain", "Entidades, value objects, enums, interfaces de dominio", "Nada"],
    ["Application", "Use cases (CQRS-light), DTOs, validators, interfaces de infra", "Domain"],
    ["Infrastructure", "EF Core DbContext, repositorios, servicios externos, Identity", "Application + Domain"],
    ["Api (Web)", "Controllers, middleware, configuracion DI, Swagger, JWT", "Application + Infrastructure"],
]
ca = Table(ca_data, colWidths=[3*cm, 9*cm, 4.5*cm])
ca.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(ca)

story.append(Paragraph("3.2 Estructura del monorepo", styles["H2Custom"]))
tree = (
    "modernizacion/<br/>"
    "&nbsp;&nbsp;docker-compose.yml<br/>"
    "&nbsp;&nbsp;README.md<br/>"
    "&nbsp;&nbsp;.editorconfig<br/>"
    "&nbsp;&nbsp;backend/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.sln<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;src/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.Api/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.Application/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.Domain/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.Infrastructure/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;tests/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.UnitTests/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VentaGamer.IntegrationTests/<br/>"
    "&nbsp;&nbsp;frontend/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;package.json<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;vite.config.ts<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;src/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;api/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;components/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;features/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;routes/<br/>"
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lib/"
)
story.append(Paragraph(tree, styles["CodeBlock"]))

story.append(PageBreak())

# ========== 4. ETAPAS ==========
story.append(Paragraph("4. Plan de etapas", styles["H1Custom"]))
story.append(Paragraph(
    "Cada etapa entrega valor probable end-to-end. No avanzamos a la siguiente hasta "
    "validar la actual. Tiempo estimado total: 8 a 12 sesiones de trabajo.",
    styles["BodyJ"]
))

etapas = [
    ("0", "Setup monorepo + Docker SQL Server",
     "Crear estructura Clean Architecture, docker-compose con SQL Server 2022, proyecto React vacio.",
     "Backend responde en /swagger, React muestra pagina inicial en localhost:5173, BD accesible en localhost:1433."),
    ("1", "EF Core + DbContext + Migration inicial",
     "Modelar las 9 entidades con EF Core. Configurar relaciones (Composite roles, idiomas). Migration y seed basico (admin, idiomas, roles, permisos).",
     "dotnet ef database update crea las tablas. Endpoint /health retorna OK. Datos seed visibles via SQL."),
    ("2", "Auth: Identity + JWT (PBKDF2)",
     "Reemplazar SHA256+SessionManager con ASP.NET Core Identity y JWT Bearer. Endpoints register/login/refresh. Politica de password robusta.",
     "Login desde Swagger devuelve JWT valido. Endpoint protegido requiere token. Password hash es PBKDF2."),
    ("3", "API Productos + Frontend catalogo publico",
     "CRUD productos con paginacion. React Router + TanStack Query. Pantalla catalogo (home), pantalla login.",
     "Catalogo paginado visible en React. Login funciona, JWT se guarda y se envia en headers."),
    ("4", "Carrito persistente + checkout + PDF",
     "Migrar carrito de Session a tabla. Endpoint checkout transaccional. Generacion PDF con QuestPDF. Pantallas Carrito y DetalleCompra.",
     "Usuario agrega items, confirma compra, descarga PDF. Compra queda registrada en BD."),
    ("5", "Roles, Permisos, ABMperfiles",
     "Endpoints para gestion jerarquica de roles. Pantalla admin con asignacion de permisos. Authorization policies en backend.",
     "Admin crea/edita roles desde React. Permisos se heredan correctamente segun jerarquia."),
    ("6", "Bitacora con interceptor EF Core",
     "Auditoria automatica via SaveChangesInterceptor. Endpoint con filtros. Pantalla bitacora con tabla filtrable.",
     "Cada operacion CUD genera registro automatico. Admin filtra por usuario/fecha/modulo."),
    ("7", "Multi-idioma (i18next + BD)",
     "i18next en frontend, endpoint que sirve traducciones desde tabla TextoIdioma. Cambio en runtime.",
     "Usuario cambia idioma desde dropdown, todos los textos se actualizan sin recargar."),
    ("8", "Backup/Restore + integridad (HMAC)",
     "Endpoints backup/restore via SMO. Reemplazar DVH por HMAC-SHA256 sobre filas criticas. Pantalla admin.",
     "Admin crea/restaura backups. Sistema detecta tampering en filas modificadas externamente."),
    ("9", "Hardening + Deploy docker-compose",
     "Refresh tokens, rate limiting, CORS estricto, secrets via env vars, healthchecks. Build de produccion.",
     "docker-compose up levanta el stack completo. Sistema pasa OWASP basico."),
]

for num, titulo, desc, criterio in etapas:
    block = []
    block.append(Paragraph(f"Etapa {num}: {titulo}", styles["H2Custom"]))
    block.append(Paragraph(f"<b>Alcance:</b> {desc}", styles["BodyJ"]))
    block.append(Paragraph(f"<b>Criterio de aceptacion:</b> {criterio}", styles["BodyJ"]))
    story.append(KeepTogether(block))

story.append(PageBreak())

# ========== 5. MAPEO LEGACY -> NUEVO ==========
story.append(Paragraph("5. Mapeo legacy -> moderno", styles["H1Custom"]))

mapping = [
    ["Componente legacy", "Equivalente moderno"],
    ["BE/*.cs (entidades anemicas)", "Domain/Entities con encapsulacion"],
    ["BLL/*.cs", "Application/UseCases (handlers)"],
    ["DAL/*.cs (ADO.NET)", "Infrastructure/Repositories + EF Core"],
    ["SECURITY/CryptoManager (SHA256)", "ASP.NET Core Identity (PBKDF2)"],
    ["SECURITY/SessionManager (estatico)", "JWT Bearer + ClaimsPrincipal"],
    ["SECURITY/LoginManager", "AuthService con UserManager<>"],
    ["SECURITY/DVManager (DVH/DVV)", "HMAC-SHA256 + audit interceptor"],
    ["BLL_Bitacora", "SaveChangesInterceptor + Serilog"],
    ["IdiomaSubject (Observer)", "i18next + endpoint /translations"],
    ["Role/Permission (IComposite)", "Identity Roles + Claims jerarquicos"],
    ["GUI/*.aspx + code-behind", "React components + API REST"],
    ["MasterPage", "Layout component en React"],
    ["ProductsService.asmx (SOAP)", "Controllers REST con OpenAPI"],
    ["Session[Carrito]", "Tabla Cart + CartItem"],
    ["Ventas.xml", "Tabla Compras + DetalleCompra"],
    ["iTextSharp 5", "QuestPDF"],
    ["Web.config", "appsettings.json + env vars"],
]
mt = Table(mapping, colWidths=[7*cm, 9*cm])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e40af")),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE", (0,0), (-1,-1), 9),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
    ("GRID", (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(mt)

story.append(PageBreak())

# ========== 6. DECISIONES ==========
story.append(Paragraph("6. Decisiones tomadas", styles["H1Custom"]))
decisiones = [
    ("Arquitectura backend", "Clean Architecture (4 proyectos)",
     "Mejor separacion de responsabilidades, mas profesional, facilita testing y mantiene Domain libre de frameworks."),
    ("BD en Docker", "mssql/server:2022-latest",
     "Soporta ARM nativo en Apple Silicon, compatible con BACKUP/RESTORE y todos los stored procedures."),
    ("Datos iniciales", "BD vacia + seed basico",
     "Mas rapido. Evita arrastrar passwords SHA256 sin salt del .bak legacy. Productos se cargan via API en pruebas."),
    ("Autenticacion", "JWT stateless + refresh tokens",
     "Estandar industria, escalable, compatible con SPAs y mobile."),
    ("Frontend state", "TanStack Query + Zustand",
     "Server state separado de client state. Cache automatico, menos boilerplate que Redux."),
    ("PDF", "QuestPDF",
     "Reemplaza iTextSharp 5 (licencia AGPL pesada). API fluida, soporte .NET 8 nativo, licencia MIT."),
]
for titulo, decision, justif in decisiones:
    story.append(Paragraph(f"<b>{titulo}:</b> {decision}", styles["H3Custom"]))
    story.append(Paragraph(justif, styles["BodyJ"]))

# ========== 7. RIESGOS ==========
story.append(Paragraph("7. Riesgos y mitigaciones", styles["H1Custom"]))
riesgos = [
    ("Curva de aprendizaje React/TS", "Etapas pequenas con pantallas simples. Documentacion incremental."),
    ("Migracion de jerarquia de roles (Composite)", "Mantener estructura ROLES + ROLESJERARQUIA con un servicio que materialice claims al login."),
    ("Tests de Identity con BD real", "TestContainers para SQL Server en integracion."),
    ("Performance de TanStack Query con muchos items", "Paginacion server-side + virtualizacion (TanStack Virtual)."),
    ("Compatibilidad SQL Server en Mac M1/M2/M3", "Imagen oficial 2022 ya tiene soporte ARM nativo (verificado)."),
]
for r, m in riesgos:
    story.append(Paragraph(f"<b>{r}:</b> {m}", styles["BodyJ"]))

# ========== 8. ENTREGABLES ==========
story.append(Paragraph("8. Entregables por etapa", styles["H1Custom"]))
story.append(Paragraph(
    "Al cierre de cada etapa se entrega: codigo funcionando, README actualizado con "
    "comandos para probar, capturas de pantalla cuando aplique, y un commit limpio. "
    "El proyecto legacy permanece intacto en la raiz.",
    styles["BodyJ"]
))

# Build
doc.build(story)
print(f"OK: {OUT}")
