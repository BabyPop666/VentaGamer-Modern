# VentaGamer

Plataforma web de **comercio electrónico de productos gaming**: catálogo, carrito, checkout con comprobante PDF, administración de usuarios con roles y permisos, auditoría, respaldos de base de datos y asistente virtual con IA.

Trabajo Práctico Integrador — **Desarrollo y Arquitecturas Web** (UAI).

📄 **Documentación técnica de entrega:** [`Documentos técnicos/`](Documentos%20técnicos/) (Markdown + PDFs en [`Documentos técnicos/PDFs/`](Documentos%20técnicos/PDFs/))

## Stack

- **Backend:** .NET 8 · ASP.NET Core Web API · Clean Architecture
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **Base de datos:** SQL Server 2022 (Docker)
- **Auth:** ASP.NET Identity + JWT
- **Extras:** EF Core, QuestPDF, i18next, backups HMAC-SHA256, chatbot con Ollama

## Estructura

```
VentaGamer-Modern/
├── docker-compose.yml       # Stack completo (web, API, SQL Server, Ollama)
├── levantar.sh              # Levantar todo con un comando
├── setup-docker.sh          # Preparación inicial de Docker (una vez)
├── Documentos técnicos/     # Documentación del TP integrador
├── backend/
│   ├── VentaGamer.sln
│   └── src/
│       ├── VentaGamer.Api/
│       ├── VentaGamer.Application/
│       ├── VentaGamer.Domain/
│       └── VentaGamer.Infrastructure/
└── frontend/                # SPA React + Vite
```

## Cómo levantar el sistema (recomendado)

Requisito: **Docker** con Compose v2.

```bash
# Una sola vez (permisos Docker + .env)
sudo ./setup-docker.sh
newgrp docker   # o cerrar y reabrir la sesión

# Levantar todo (build + BD + API + frontend + Ollama)
./levantar.sh
```

La primera ejecución puede tardar varios minutos (imágenes, compilación y descarga del modelo de IA ~2 GB).

| Servicio | URL |
|---|---|
| **Aplicación web** | http://localhost:8080 |
| API (Swagger) | http://localhost:5050/swagger |
| Health check | http://localhost:5050/api/health |
| SQL Server | `localhost,1434` (usuario `sa`) |
| Ollama | http://localhost:11434 |

Al arrancar, la API aplica las migraciones de EF Core y carga los datos demo (usuarios, roles, productos, traducciones).

## Usuarios demo

| Usuario | Contraseña | Rol | Uso típico |
|---|---|---|---|
| `cliente` | `Cliente123!` | Cliente | Catálogo, carrito, checkout, chat IA |
| `admin` | `Admin123!` | Admin | Productos, usuarios, roles |
| `webmaster` | `WebMaster123!` | WebMaster | Bitácora y backups |
| `juan` | `Juan123!` | Cliente | Segundo cliente de prueba |
| `tester` | `Tester123!` | Tester | Perfil mixto de consulta |

## Desarrollo local (opcional)

Si preferís correr servicios por separado en lugar de Docker:

```bash
docker compose up -d sqlserver ollama
cd backend && dotnet run --project src/VentaGamer.Api
cd frontend && npm install && npm run dev
```

- Frontend en desarrollo: http://localhost:5173 (proxy a la API en `:5050`)
- Detalle completo: [`Documentos técnicos/11-ejecucion.md`](Documentos%20técnicos/11-ejecucion.md)

## Comandos útiles

```bash
docker compose ps
docker compose logs -f
docker compose down        # detener (datos persisten)
docker compose down -v     # detener y borrar volúmenes
```
