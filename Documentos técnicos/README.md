# VentaGamer — Documentación técnica

## Carátula

| Campo | Dato |
|---|---|
| **Universidad** | Universidad Abierta Interamericana (UAI) |
| **Materia** | Desarrollo y Arquitecturas Web |
| **Trabajo** | Trabajo Práctico Integrador |
| **Sistema** | VentaGamer — Plataforma web de venta de productos gaming |
| **Profesor/a** | Escandell Gustavo Emanuel |
| **Integrantes** | Fazzari, Franco Tomás · Mastromarino, Nicolás · Reser, Iván Leonel |
| **Fecha de entrega** | 09/07/2026 |

> **Versión PDF:** los documentos también están disponibles en la carpeta [`PDFs/`](PDFs/) (generados con `pdf-build/generar-pdfs.mjs`).

---

## Propósito de esta carpeta

Esta carpeta reúne la **documentación técnica de entrega** del Trabajo Práctico Integrador. Está pensada para que cualquier lector (docente o estudiante) pueda comprender qué problema resuelve el sistema, cómo está construido y cómo ponerlo en funcionamiento, sin necesidad de leer previamente el código fuente.

La documentación está dividida en varios documentos Markdown para facilitar su lectura y edición. Todos los diagramas están escritos en [Mermaid](https://mermaid.js.org/), por lo que pueden editarse como texto y se renderizan automáticamente en GitHub, VS Code y la mayoría de los visores de Markdown.

## Índice de documentos

| # | Documento | Contenido |
|---|---|---|
| 1 | [Problema y temática](01-problema-y-tematica.md) | Definición del problema, justificación, objetivo general y público objetivo |
| 2 | [Requerimientos](02-requerimientos.md) | Actores del sistema, requerimientos funcionales y no funcionales |
| 3 | [Casos de uso](03-casos-de-uso.md) | Diagrama general y casos de uso detallados |
| 4 | [Arquitectura](04-arquitectura.md) | Arquitectura de despliegue (Docker), backend, frontend y stack tecnológico |
| 5 | [Base de datos](05-base-de-datos.md) | DER, detalle de tablas, migraciones EF Core y script SQL demostrativo |
| 6 | [APIs](06-apis.md) | Referencia de la API REST, autenticación JWT, manejo de errores y SignalR |
| 7 | [Frontend](07-frontend.md) | Páginas, manipulación del DOM, diseño responsivo, formularios y multi-idioma |
| 8 | [Calidad y normativa](08-calidad-y-normativa.md) | Buenas prácticas, seguridad, usabilidad, accesibilidad y Ley 25.326 |
| 9 | [Chatbot con IA](09-chatbot-ia.md) | Asistente "GG": arquitectura, herramientas y streaming |
| 10 | [Backup y recuperación](10-backup-y-recuperacion.md) | Estrategia de respaldo, integridad HMAC y procedimiento de recuperación |
| 11 | [Ejecución del proyecto](11-ejecucion.md) | Cómo levantar el sistema con Docker, usuarios demo y solución de problemas |
| — | [`sql/ventagamer-demo.sql`](sql/ventagamer-demo.sql) | Script SQL simplificado con fines demostrativos |

## Correspondencia con la rúbrica de evaluación

La siguiente tabla mapea cada semana de la rúbrica del trabajo práctico con el documento que cubre lo evaluado.

| Semana | Qué se evalúa | Documento que lo cubre |
|---|---|---|
| 1 | Claridad y profundidad del problema, coherencia de la temática, justificación | [01 — Problema y temática](01-problema-y-tematica.md) |
| 2 | Requerimientos funcionales (≥10) y no funcionales (≥5), redacción técnica | [02 — Requerimientos](02-requerimientos.md) |
| 3 | Actores, casos de uso completos (≥5), arquitectura cliente-servidor, módulos | [03 — Casos de uso](03-casos-de-uso.md) · [04 — Arquitectura](04-arquitectura.md) |
| 4 | Entidades, DER (≥4-6 tablas), claves primarias y foráneas, script SQL | [05 — Base de datos](05-base-de-datos.md) · [`sql/`](sql/ventagamer-demo.sql) |
| 5 | Estructura HTML, navegación interna, estilos CSS, organización de la interfaz | [07 — Frontend](07-frontend.md) |
| 6 | Diseño responsivo, manipulación del DOM, eventos, formularios y validaciones | [07 — Frontend](07-frontend.md) |
| 7 | Integración de API con fetch, datos dinámicos, manejo de errores | [06 — APIs](06-apis.md) |
| 8 | Persistencia de datos, consultas, filtros y búsquedas | [05 — Base de datos](05-base-de-datos.md) · [06 — APIs](06-apis.md) |
| 9 | Calidad del código, cumplimiento normativo (Ley 25.326), usabilidad, extras | [08 — Calidad y normativa](08-calidad-y-normativa.md) · [09 — Chatbot](09-chatbot-ia.md) · [10 — Backup](10-backup-y-recuperacion.md) |
| 10 | Funcionamiento integral, explicación técnica, dominio del sistema | Toda la carpeta · [11 — Ejecución](11-ejecucion.md) |

## Guía de lectura sugerida

1. Comenzar por el documento **01** para entender el problema y el alcance del sistema.
2. Continuar con **02** y **03** para conocer qué hace el sistema y quiénes lo usan.
3. Leer **04** y **05** para comprender cómo está construido (arquitectura y datos).
4. Consultar **06** y **07** para el detalle de API y frontend.
5. Cerrar con **08**, **09** y **10** (calidad, normativa y funcionalidades avanzadas).
6. El documento **11** permite ejecutar el sistema y verificar todo lo anterior en funcionamiento.
