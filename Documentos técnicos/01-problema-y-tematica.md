# 1. Problema y temática

[← Volver al índice](README.md)

## 1.1. Temática elegida

La temática elegida es el **comercio electrónico de productos gaming**: consolas, periféricos (mandos, teclados, mouse, auriculares), monitores, sillas, equipamiento de streaming y videojuegos.

El sistema desarrollado se llama **VentaGamer** y es una plataforma web de venta online que integra catálogo de productos, carrito de compras, gestión de pedidos con comprobantes en PDF, administración de usuarios con roles y permisos, auditoría de operaciones, respaldo de datos y un asistente virtual con inteligencia artificial.

## 1.2. Definición del problema

### ¿Qué problema se resuelve?

Los comercios dedicados a la venta de productos gaming suelen gestionar su operación con herramientas dispersas: planillas de cálculo para el stock, redes sociales para mostrar productos y mensajería para concretar ventas. Este esquema presenta problemas concretos:

- **Falta de un canal de venta unificado.** El cliente no puede ver el catálogo completo, consultar stock real ni comprar de forma autónoma; cada venta requiere intervención manual.
- **Ausencia de control de stock confiable.** Al no existir una fuente única de datos, se venden productos sin stock o se pierden ventas por desconocimiento de la disponibilidad real.
- **Sin trazabilidad de operaciones.** No queda registro de quién modificó un precio, quién dio de baja un producto o cuándo se realizó una venta, lo que dificulta detectar errores y deslinda responsabilidades.
- **Datos sin resguardo.** La información comercial (clientes, ventas, stock) no cuenta con mecanismos de respaldo ni de verificación de integridad, con el riesgo de pérdida total ante una falla.
- **Atención al cliente limitada.** Las consultas repetitivas (precios, stock, estado de un pedido) consumen tiempo del personal y demoran la respuesta al cliente.

### ¿A quién afecta?

- A los **clientes**, que no disponen de un medio ágil y autónomo para explorar productos, comparar precios y comprar.
- A los **administradores del comercio**, que carecen de herramientas centralizadas para gestionar catálogo, usuarios y ventas.
- Al **personal técnico**, que no cuenta con mecanismos de auditoría, respaldo y recuperación de la información.

### ¿Por qué es importante resolverlo?

El comercio electrónico es hoy el canal de venta dominante en el rubro tecnológico. Un comercio sin plataforma propia depende de terceros, pierde competitividad y expone sus datos a riesgos evitables. Resolver este problema con una aplicación web integral permite: vender de forma autónoma las 24 horas, mantener un stock consistente, cumplir con la normativa de protección de datos personales y garantizar la continuidad del negocio ante fallas.

## 1.3. Justificación de la elección

Se eligió esta temática por tres razones:

1. **Riqueza funcional.** Una tienda online exige resolver problemas variados y representativos de la ingeniería de software: autenticación y autorización, transacciones (una compra debe descontar stock y registrar el pedido de forma atómica), generación de documentos, auditoría, respaldo e internacionalización. Esto permite aplicar de manera natural todos los contenidos de la materia.
2. **Cercanía con el usuario final.** El dominio es conocido por cualquier persona (todos compramos online), lo que facilita validar los requerimientos y evaluar la usabilidad del resultado.
3. **Escalabilidad del planteo.** El modelo de datos y la arquitectura elegida permiten crecer hacia escenarios de mayor volumen (más productos, más usuarios, más ventas) sin rediseñar el sistema.

## 1.4. Nombre del sistema

**VentaGamer** — plataforma web de venta de productos gaming.

## 1.5. Objetivo general

Desarrollar una **aplicación web responsiva** de comercio electrónico que permita a los clientes explorar un catálogo de productos gaming, gestionar un carrito y concretar compras con comprobante descargable; y a los perfiles administrativos, gestionar el catálogo, los usuarios, los roles y permisos, la auditoría de operaciones y el respaldo de la información — todo ello sobre una arquitectura cliente-servidor con API REST, base de datos relacional y estándares de calidad, seguridad y cumplimiento normativo (Ley 25.326 de Protección de Datos Personales).

## 1.6. Objetivos específicos

- Ofrecer un catálogo navegable con búsqueda, filtrado por categoría y paginación.
- Implementar registro e inicio de sesión seguros, con bloqueo automático ante intentos fallidos reiterados.
- Permitir la compra mediante carrito y checkout transaccional que garantice la consistencia del stock.
- Emitir comprobantes de compra en formato PDF.
- Administrar usuarios, roles y permisos con un esquema de autorización granular.
- Registrar automáticamente en una bitácora las operaciones relevantes del sistema.
- Soportar múltiples idiomas (español, inglés y portugués).
- Proveer mecanismos de respaldo de la base de datos y verificación de integridad de los datos.
- Incorporar un asistente virtual con IA que ayude a clientes y administradores a consultar información del sistema en lenguaje natural.

## 1.7. Público objetivo

| Perfil | Descripción |
|---|---|
| **Clientes** | Personas interesadas en productos gaming que desean explorar el catálogo y comprar online. Incluye visitantes no registrados (solo consulta) y usuarios registrados (compra). |
| **Administradores** | Personal del comercio responsable del catálogo de productos, de los usuarios y de la configuración del sistema. |
| **WebMasters** | Personal técnico responsable del mantenimiento: auditoría, copias de seguridad y verificación de integridad. |
| **Testers** | Perfil de control de calidad con acceso mixto de solo consulta para verificar el funcionamiento del sistema. |

## 1.8. Alcance

**Incluye:** catálogo con búsqueda y filtros, registro/login con JWT, carrito y checkout transaccional, comprobantes PDF, panel de administración (productos, usuarios, roles y permisos), bitácora de auditoría, backups de base de datos, verificación de integridad HMAC, multi-idioma, chatbot con IA (Ollama) y despliegue completo con Docker.

**No incluye (fuera de alcance de esta versión):** pasarela de pagos real, gestión de envíos y logística, notificaciones por correo electrónico, y recuperación de contraseña operativa (la interfaz existe a modo demostrativo, sin backend asociado).

---

[← Volver al índice](README.md) · [Siguiente: Requerimientos →](02-requerimientos.md)
