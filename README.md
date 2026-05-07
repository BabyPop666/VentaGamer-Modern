# Venta Gamer — Modernización

Migración progresiva del proyecto ASP.NET WebForms (.NET Framework 4.8) a un stack moderno cross-platform que corre nativo en macOS.

> El proyecto **legacy** sigue intacto en la raíz del repo. Esta carpeta vive en paralelo y se construye etapa por etapa.

📄 **Plan completo en PDF:** [`docs/Plan_Modernizacion.pdf`](docs/Plan_Modernizacion.pdf)

## Stack

- **Backend:** .NET 8 LTS · ASP.NET Core Web API · Clean Architecture (4 proyectos)
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **Base de datos:** SQL Server 2022 en Docker (puerto host **1434**)
- **Próximas etapas:** EF Core 8, Identity + JWT, TanStack Query, QuestPDF, i18next

## Estructura

```
modernizacion/
├── docker-compose.yml          # SQL Server 2022
├── docs/Plan_Modernizacion.pdf # Plan completo (10 etapas)
├── backend/
│   ├── VentaGamer.sln
│   ├── global.json             # fija .NET 8.0.417
│   └── src/
│       ├── VentaGamer.Api/             # Web API + Controllers
│       ├── VentaGamer.Application/     # Use cases / DTOs
│       ├── VentaGamer.Domain/          # Entities / VOs
│       └── VentaGamer.Infrastructure/  # EF Core / Identity / repos
└── frontend/                   # Vite + React + TS
    ├── src/App.tsx             # health check del backend
    └── vite.config.ts          # proxy /api → :5050
```

## Cómo levantar todo (etapa 0)

Necesitás **.NET 8 SDK**, **Node 20+**, **Docker Desktop**.

### 1. Base de datos (SQL Server)

```bash
cd modernizacion
docker compose up -d sqlserver

# Verificación
docker exec ventagamer-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'VentaGamer2024!' -C -Q "SELECT @@VERSION"
```

Puerto host: `1434`. Usuario: `sa`. Password: `VentaGamer2024!`.

> En Apple Silicon corre vía Rosetta (Microsoft no publica imagen ARM nativa). Funciona, solo un poco más lento al arrancar.

### 2. Backend

```bash
cd backend
dotnet restore
dotnet run --project src/VentaGamer.Api
```

Abrir http://localhost:5050/swagger → debería mostrar el endpoint `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install   # solo la primera vez
npm run dev
```

Abrir http://localhost:5173 → debería mostrar la card con el resultado del health check verde.

## Validación de la etapa 0

| Check | URL / comando | Resultado esperado |
|---|---|---|
| BD activa | `docker ps` | `ventagamer-sql` healthy |
| BD acepta queries | `sqlcmd -S localhost,1434 ...` | `Microsoft SQL Server 2022` |
| Backend Swagger | http://localhost:5050/swagger | UI de Swagger |
| Backend health | http://localhost:5050/api/health | `{"status":"ok",...}` |
| Frontend | http://localhost:5173 | Card "VentaGamer · etapa 0" con health verde |
| CORS | F12 → Network en frontend | Sin errores CORS |

## Etapas siguientes

| # | Etapa | Estado |
|---|---|---|
| 0 | Setup monorepo + Docker SQL Server | ✅ |
| 1 | EF Core + DbContext + Migration inicial | ⏳ |
| 2 | Auth: Identity + JWT (PBKDF2) | ⏳ |
| 3 | API Productos + Frontend catálogo | ⏳ |
| 4 | Carrito + checkout + PDF | ⏳ |
| 5 | Roles + Permisos + ABMperfiles | ⏳ |
| 6 | Bitácora con interceptor EF | ⏳ |
| 7 | Multi-idioma (i18next + BD) | ⏳ |
| 8 | Backup/Restore + integridad | ⏳ |
| 9 | Hardening + Deploy docker-compose | ⏳ |
