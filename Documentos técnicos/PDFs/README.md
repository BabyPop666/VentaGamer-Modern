# PDFs — Documentación técnica VentaGamer

Versión en PDF de la documentación del Trabajo Práctico Integrador.

## Archivos

| PDF | Contenido |
|---|---|
| `00-Indice-y-Caratula.pdf` | Índice, carátula y mapa de la rúbrica |
| `01-Problema-y-Tematica.pdf` | Problema, justificación y alcance |
| `02-Requerimientos.pdf` | Actores, RF y RNF |
| `03-Casos-de-Uso.pdf` | Casos de uso detallados |
| `04-Arquitectura.pdf` | Arquitectura y stack tecnológico |
| `05-Base-de-Datos.pdf` | DER, entidades y modelo de datos |
| `06-APIs.pdf` | Referencia de la API REST |
| `07-Frontend.pdf` | Interfaz, DOM y responsive |
| `08-Calidad-y-Normativa.pdf` | Calidad, seguridad y Ley 25.326 |
| `09-Chatbot-IA.pdf` | Asistente GG con Ollama |
| `10-Backup-y-Recuperacion.pdf` | Estrategia de respaldo |
| `11-Ejecucion.pdf` | Cómo ejecutar el proyecto |
| **`VentaGamer-Documentacion-Completa.pdf`** | **Todos los capítulos en un solo archivo** |

## Formato

- Encabezado con logo UAI (izquierda) y título del capítulo (derecha)
- Pie de página: materia, fecha de entrega y numeración de páginas
- Diagramas Mermaid renderizados como imágenes vectoriales
- Colores institucionales UAI (`#632634`)

## Regenerar los PDFs

Si editás los archivos `.md`, volvé a generar con:

```bash
cd "../pdf-build"
npm install   # solo la primera vez
node generar-pdfs.mjs
```
