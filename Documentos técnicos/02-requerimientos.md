# 2. Actores y requerimientos

[← Volver al índice](README.md)

## 2.1. Actores del sistema

Un **actor** es cualquier entidad externa que interactúa con el sistema. En VentaGamer los actores humanos se corresponden con los roles definidos en la base de datos (tabla `Roles`), a los que se suma el visitante no autenticado y dos actores de sistema.

| Actor | Tipo | Descripción |
|---|---|---|
| **Visitante** | Humano | Persona no autenticada. Puede navegar el catálogo, buscar y filtrar productos, registrarse e iniciar sesión. No puede comprar. |
| **Cliente** (rol `User`) | Humano | Usuario registrado. Además de lo anterior, gestiona su carrito, realiza compras, consulta sus pedidos y descarga comprobantes PDF. Puede conversar con el asistente IA. |
| **Administrador** (rol `Admin`) | Humano | Gestiona el catálogo de productos (altas, bajas y modificaciones), los usuarios (bloqueo, cambio de rol), los roles y permisos, y la configuración del asistente IA. No realiza compras. |
| **WebMaster** (rol `WebMaster`) | Humano | Perfil técnico. Consulta la bitácora de auditoría, genera copias de seguridad y ejecuta verificaciones de integridad de los datos. |
| **Tester** (rol `Tester`) | Humano | Perfil de control de calidad con acceso mixto de consulta: catálogo, carrito, roles y bitácora. |
| **Asistente GG** | Sistema (IA) | Chatbot que responde consultas en lenguaje natural. Actúa en nombre del usuario autenticado: solo accede a los datos que los permisos de ese usuario habilitan. |
| **Servidor Ollama** | Sistema externo | Motor de inferencia del modelo de lenguaje que da soporte al asistente GG. |

### Permisos por rol

La autorización es granular: cada rol posee un conjunto de **permisos** (12 en total) y las pantallas y endpoints exigen permisos puntuales, no roles. El detalle completo se desarrolla en [06 — APIs](06-apis.md) y [08 — Calidad y normativa](08-calidad-y-normativa.md).

| Permiso | Cliente (User) | Admin | WebMaster | Tester |
|---|:---:|:---:|:---:|:---:|
| `products.read` — ver catálogo | ✔ | ✔ | — | ✔ |
| `products.write` — ABM de productos | — | ✔ | — | — |
| `cart.use` — carrito y compra | ✔ | — | — | ✔ |
| `orders.read.own` — ver compras propias | ✔ | — | — | — |
| `orders.read.all` — ver todas las compras | — | ✔ | — | — |
| `users.register` — gestionar usuarios | — | ✔ | — | — |
| `roles.read` — ver roles y permisos | — | ✔ | — | ✔ |
| `roles.write` — ABM de roles | — | ✔ | — | — |
| `audit.read` — consultar bitácora | — | ✔ | ✔ | ✔ |
| `backup.manage` — crear/listar backups | — | ✔ | ✔ | — |
| `integrity.check` — verificar integridad | — | ✔ | ✔ | — |
| `config.read` — ver configuración | ✔ | ✔ | ✔ | ✔ |

> El rol Admin recibe por seed todos los permisos excepto los de compra (`cart.use`, `orders.read.own`), reflejando que el administrador gestiona el sistema pero no compra. Además, el modelo soporta **jerarquía de roles**: un rol puede heredar los permisos de otros roles "padre" (tabla `RoleHierarchies`).

## 2.2. Requerimientos funcionales

| ID | Requerimiento | Módulo |
|---|---|---|
| **RF-01** | El sistema debe permitir el **registro de nuevos usuarios** con nombre de usuario único, contraseña de al menos 8 caracteres e idioma preferido. Ante un nombre ya existente debe informarse el conflicto. | Autenticación |
| **RF-02** | El sistema debe permitir el **inicio de sesión** con usuario y contraseña, devolviendo un token JWT con vigencia de 60 minutos que habilita las operaciones protegidas. | Autenticación |
| **RF-03** | El sistema debe **bloquear automáticamente** una cuenta tras 3 intentos consecutivos de inicio de sesión fallidos, e informar la situación al usuario. Solo un administrador puede desbloquearla. | Autenticación |
| **RF-04** | El sistema debe exhibir un **catálogo de productos paginado**, con búsqueda por texto libre y filtrado por categoría, accesible sin necesidad de autenticarse. | Catálogo |
| **RF-05** | El sistema debe permitir a los usuarios con permiso de compra **gestionar un carrito**: agregar productos, modificar cantidades y quitar ítems, validando en todo momento el stock disponible. | Carrito |
| **RF-06** | El sistema debe permitir **confirmar la compra (checkout)** de forma transaccional: verificar stock, descontarlo, generar el pedido con número único (formato `VG-fecha-sufijo`) y vaciar el carrito en una única operación atómica. | Pedidos |
| **RF-07** | El sistema debe permitir al cliente **consultar sus pedidos** y **descargar el comprobante en PDF** de cada uno; los usuarios con permiso ampliado pueden consultar los pedidos de todos los clientes. | Pedidos |
| **RF-08** | El sistema debe permitir a los administradores realizar el **ABM de productos** (alta, modificación y baja lógica), incluyendo título, categoría, precio, stock e imagen. | Administración |
| **RF-09** | El sistema debe permitir a los administradores **gestionar usuarios**: listar, bloquear/desbloquear y cambiar el rol asignado. | Administración |
| **RF-10** | El sistema debe permitir el **ABM de roles y la asignación de permisos**, incluyendo la posibilidad de que un rol herede los permisos de otros (jerarquía de roles). | Administración |
| **RF-11** | El sistema debe **registrar automáticamente en una bitácora** las operaciones de creación, modificación y eliminación sobre productos, usuarios, roles, permisos y pedidos, indicando fecha, módulo, usuario y detalle. La bitácora debe poder consultarse con filtros por usuario, módulo y rango de fechas. | Auditoría |
| **RF-12** | El sistema debe permitir **generar copias de seguridad** de la base de datos y consultar el historial de backups realizados. | Mantenimiento |
| **RF-13** | El sistema debe ofrecer una **verificación de integridad** de los datos críticos (usuarios y pedidos) mediante firmas HMAC-SHA256. | Mantenimiento |
| **RF-14** | El sistema debe ofrecer su interfaz en **tres idiomas** (español, inglés y portugués), con las traducciones almacenadas en la base de datos y seleccionables por el usuario. | Internacionalización |
| **RF-15** | El sistema debe ofrecer un **asistente virtual con IA** ("GG") capaz de responder consultas en lenguaje natural sobre catálogo, stock y pedidos, respetando los permisos del usuario que consulta y transmitiendo las respuestas en tiempo real (streaming). | Chatbot IA |

## 2.3. Requerimientos no funcionales

| ID | Requerimiento | Categoría |
|---|---|---|
| **RNF-01** | **Diseño responsivo:** la interfaz debe adaptarse a móviles, tablets y escritorio, con navegación utilizable en todos los tamaños de pantalla (menú colapsable en móvil, grillas adaptativas). | Usabilidad |
| **RNF-02** | **Seguridad de credenciales:** las contraseñas deben almacenarse con hash PBKDF2 (nunca en texto plano) y la autenticación de la API debe realizarse mediante tokens JWT firmados con HMAC-SHA256. | Seguridad |
| **RNF-03** | **Autorización granular:** el acceso a cada operación protegida debe validarse en el servidor mediante políticas basadas en permisos, independientemente de lo que la interfaz muestre u oculte. | Seguridad |
| **RNF-04** | **Protección contra abuso:** la API debe limitar la tasa de solicitudes (60 solicitudes por minuto por IP en general, y 5 por minuto en los endpoints de login/registro) para mitigar ataques de fuerza bruta y denegación de servicio. | Seguridad |
| **RNF-05** | **Consistencia transaccional:** las operaciones de compra deben ejecutarse dentro de una transacción de base de datos; ante cualquier falla, el sistema debe revertir todos los cambios (no puede descontarse stock sin registrarse el pedido, ni viceversa). | Confiabilidad |
| **RNF-06** | **Consultas eficientes:** las búsquedas y listados deben resolverse con paginación e índices de base de datos (índices sobre categoría, título, número de pedido, fechas de bitácora, etc.) para mantener tiempos de respuesta adecuados al crecer el volumen de datos. | Rendimiento |
| **RNF-07** | **Mantenibilidad:** el backend debe organizarse en capas con dependencias unidireccionales (Clean Architecture) y el frontend en módulos por funcionalidad, con tipado estático (TypeScript / C#) y verificación automática de estilo (ESLint). | Mantenibilidad |
| **RNF-08** | **Portabilidad:** todo el sistema debe poder ejecutarse en cualquier equipo con Docker mediante un único comando de orquestación (`docker compose up`), sin instalación manual de dependencias. | Portabilidad |
| **RNF-09** | **Cumplimiento normativo:** el tratamiento de datos personales debe ajustarse a la Ley 25.326 de Protección de Datos Personales de la República Argentina, minimizando los datos recolectados e informando su uso. | Normativa |
| **RNF-10** | **Recuperabilidad:** el sistema debe proveer mecanismos de respaldo de la información y un procedimiento documentado de recuperación ante fallos. | Confiabilidad |

## 2.4. Trazabilidad requerimientos → módulos del sistema

| Módulo | Requerimientos | Dónde está implementado |
|---|---|---|
| Autenticación | RF-01, RF-02, RF-03, RNF-02 | `backend/src/VentaGamer.Infrastructure/Auth/` · `frontend/src/features/auth/` |
| Catálogo | RF-04, RNF-06 | `backend/.../Products/` · `frontend/src/routes/CatalogPage.tsx` |
| Carrito | RF-05 | `backend/.../Carts/` · `frontend/src/routes/CartPage.tsx` |
| Pedidos | RF-06, RF-07, RNF-05 | `backend/.../Orders/` · `frontend/src/routes/MyOrdersPage.tsx` |
| Administración | RF-08, RF-09, RF-10, RNF-03 | `backend/.../Admin/` · `frontend/src/routes/AdminPage.tsx` |
| Auditoría | RF-11 | `backend/.../Audit/` (interceptor de EF Core) · `frontend/src/routes/AuditPage.tsx` |
| Mantenimiento | RF-12, RF-13, RNF-10 | `backend/.../Maintenance/` · `frontend/src/routes/MaintenancePage.tsx` |
| Internacionalización | RF-14 | `backend/.../I18nController.cs` · `frontend/src/lib/i18n.ts` |
| Chatbot IA | RF-15 | `backend/.../Ai/` · `frontend/src/features/ai/` |
| Transversal | RNF-01, RNF-04, RNF-07, RNF-08, RNF-09 | Tailwind CSS · rate limiting en `Program.cs` · `docker-compose.yml` |

---

[← Anterior: Problema y temática](01-problema-y-tematica.md) · [Volver al índice](README.md) · [Siguiente: Casos de uso →](03-casos-de-uso.md)
