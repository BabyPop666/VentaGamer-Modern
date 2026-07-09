/* ============================================================================
   VentaGamer - Script SQL DEMOSTRATIVO
   ============================================================================
   IMPORTANTE: este script es ILUSTRATIVO. Su objetivo es que el lector
   comprenda, en SQL estandar, la estructura de las tablas nucleo del sistema
   y como se relacionan entre si.

   La base de datos REAL no se crea con este script sino mediante MIGRACIONES
   de Entity Framework Core (enfoque code-first), que se aplican de forma
   automatica al iniciar la API. Ver:
     - Entidades:       backend/src/VentaGamer.Domain/Entities/
     - Mapeos:          backend/src/VentaGamer.Infrastructure/Persistence/Configurations/
     - Migraciones:     backend/src/VentaGamer.Infrastructure/Persistence/Migrations/
     - Datos iniciales: backend/src/VentaGamer.Infrastructure/Persistence/Seed/DbSeeder.cs

   Por claridad se omiten aqui las tablas secundarias (Translations,
   SystemSettings, AiConversations, AiMessages) y algunos detalles menores.
   El esquema completo esta documentado en 05-base-de-datos.md.
   ============================================================================ */

-- ============================================================
-- AREA DE SEGURIDAD: usuarios, roles y permisos
-- ============================================================

-- Idiomas disponibles para la interfaz (es / en / pt)
CREATE TABLE Languages (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Code         NVARCHAR(8)   NOT NULL UNIQUE,   -- 'es', 'en', 'pt'
    Name         NVARCHAR(60)  NOT NULL,
    CreatedAtUtc DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Perfiles de acceso (Admin, WebMaster, User, Tester)
CREATE TABLE Roles (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(60)  NOT NULL UNIQUE,
    Description  NVARCHAR(200) NOT NULL,
    CreatedAtUtc DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Catalogo de permisos atomicos (products.write, cart.use, audit.read, etc.)
CREATE TABLE Permissions (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Code         NVARCHAR(80)  NOT NULL UNIQUE,
    Description  NVARCHAR(200) NOT NULL,
    CreatedAtUtc DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Relacion N:M entre roles y permisos
CREATE TABLE RolePermissions (
    RoleId       INT NOT NULL,
    PermissionId INT NOT NULL,
    PRIMARY KEY (RoleId, PermissionId),
    FOREIGN KEY (RoleId)       REFERENCES Roles(Id)       ON DELETE CASCADE,
    FOREIGN KEY (PermissionId) REFERENCES Permissions(Id) ON DELETE CASCADE
);

-- Herencia entre roles: un rol "hijo" hereda los permisos de su rol "padre"
CREATE TABLE RoleHierarchies (
    ParentRoleId INT NOT NULL,
    ChildRoleId  INT NOT NULL,
    PRIMARY KEY (ParentRoleId, ChildRoleId),
    FOREIGN KEY (ParentRoleId) REFERENCES Roles(Id),   -- sin cascada:
    FOREIGN KEY (ChildRoleId)  REFERENCES Roles(Id)    -- borrado restringido
);

-- Cuentas de usuario. La password se guarda como hash PBKDF2 (nunca en claro).
CREATE TABLE Users (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    Username            NVARCHAR(60)  NOT NULL UNIQUE,
    PasswordHash        NVARCHAR(500) NOT NULL,
    IsBlocked           BIT           NOT NULL DEFAULT 0,  -- bloqueo tras 3 intentos fallidos
    FailedLoginAttempts INT           NOT NULL DEFAULT 0,
    LastLoginUtc        DATETIME2     NULL,
    LanguageId          INT           NOT NULL,
    RoleId              INT           NOT NULL,
    CreatedAtUtc        DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (LanguageId) REFERENCES Languages(Id),  -- RESTRICT: no borrar
    FOREIGN KEY (RoleId)     REFERENCES Roles(Id)       -- idiomas/roles en uso
);

-- ============================================================
-- AREA DE CATALOGO Y VENTAS
-- ============================================================

-- Catalogo de productos. La baja es LOGICA (IsActive = 0), nunca fisica,
-- para preservar la integridad de los pedidos historicos.
CREATE TABLE Products (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Title        NVARCHAR(200) NOT NULL,
    Category     NVARCHAR(80)  NOT NULL,
    Price        DECIMAL(18,2) NOT NULL,
    Stock        INT           NOT NULL CHECK (Stock >= 0),
    ImageUrl     NVARCHAR(500) NULL,
    IsActive     BIT           NOT NULL DEFAULT 1,
    CreatedAtUtc DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Products_Category ON Products(Category);  -- filtro por categoria
CREATE INDEX IX_Products_Title    ON Products(Title);     -- busqueda por texto

-- Carrito: exactamente UNO por usuario (indice unico sobre UserId)
CREATE TABLE Carts (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    UserId       INT       NOT NULL UNIQUE,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Items del carrito: un producto aparece una sola vez por carrito
-- (si se agrega de nuevo, se incrementa Quantity)
CREATE TABLE CartItems (
    Id        INT IDENTITY(1,1) PRIMARY KEY,
    CartId    INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity  INT NOT NULL CHECK (Quantity > 0),
    UNIQUE (CartId, ProductId),
    FOREIGN KEY (CartId)    REFERENCES Carts(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id)  -- RESTRICT
);

-- Pedidos confirmados. OrderNumber es unico: 'VG-{fecha}-{sufijo}'
CREATE TABLE Orders (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    UserId      INT           NOT NULL,
    OrderNumber NVARCHAR(40)  NOT NULL UNIQUE,
    PlacedAtUtc DATETIME2     NOT NULL,
    Total       DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id)  -- RESTRICT: registro contable
);
CREATE INDEX IX_Orders_PlacedAtUtc ON Orders(PlacedAtUtc);
CREATE INDEX IX_Orders_UserId      ON Orders(UserId);

-- Items del pedido: guardan una COPIA (snapshot) del titulo y el precio
-- del producto al momento de la compra, para que el historial no cambie
-- si el administrador modifica el catalogo despues.
CREATE TABLE OrderItems (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    OrderId      INT           NOT NULL,
    ProductId    INT           NOT NULL,
    ProductTitle NVARCHAR(200) NOT NULL,   -- snapshot
    UnitPrice    DECIMAL(18,2) NOT NULL,   -- snapshot
    Quantity     INT           NOT NULL CHECK (Quantity > 0),
    FOREIGN KEY (OrderId)   REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id)  -- RESTRICT
);

-- ============================================================
-- AREA DE AUDITORIA
-- ============================================================

-- Bitacora: se alimenta automaticamente desde un interceptor de EF Core
-- ante cada CREATE / UPDATE / DELETE sobre entidades sensibles.
CREATE TABLE AuditLogs (
    Id       INT IDENTITY(1,1) PRIMARY KEY,
    EventUtc DATETIME2     NOT NULL,
    Module   NVARCHAR(60)  NOT NULL,   -- 'Products', 'Orders', 'Auth', ...
    Message  NVARCHAR(500) NOT NULL,   -- 'UPDATE Product(5) fields=Price,Stock'
    UserId   INT           NULL,       -- SET NULL: la bitacora sobrevive al usuario
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
);
CREATE INDEX IX_AuditLogs_EventUtc ON AuditLogs(EventUtc);
CREATE INDEX IX_AuditLogs_Module   ON AuditLogs(Module);

-- ============================================================
-- DATOS DE EJEMPLO (equivalentes a los que siembra DbSeeder)
-- ============================================================

INSERT INTO Languages (Code, Name) VALUES
    ('es', 'Espanol'), ('en', 'English'), ('pt', 'Portugues');

INSERT INTO Roles (Name, Description) VALUES
    ('Admin',     'Administrador del sistema'),
    ('WebMaster', 'Mantenimiento tecnico y bitacora'),
    ('User',      'Cliente final'),
    ('Tester',    'QA / pruebas');

INSERT INTO Permissions (Code, Description) VALUES
    ('products.read',   'Ver catalogo de productos'),
    ('products.write',  'Crear / editar / eliminar productos'),
    ('cart.use',        'Usar el carrito y comprar'),
    ('orders.read.own', 'Ver compras propias'),
    ('orders.read.all', 'Ver compras de todos los usuarios'),
    ('users.register',  'Registrar nuevos usuarios'),
    ('roles.read',      'Ver roles y permisos'),
    ('roles.write',     'Crear / editar / eliminar roles y permisos'),
    ('audit.read',      'Consultar bitacora'),
    ('backup.manage',   'Crear / restaurar backups'),
    ('integrity.check', 'Validar integridad de datos'),
    ('config.read',     'Ver configuracion del sistema');

-- Ejemplo: el rol User (cliente) puede ver el catalogo, comprar y ver sus pedidos
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.Id, p.Id
FROM Roles r CROSS JOIN Permissions p
WHERE r.Name = 'User'
  AND p.Code IN ('products.read', 'cart.use', 'orders.read.own', 'config.read');

-- Productos de ejemplo (el seeder real carga 20 en 9 categorias)
INSERT INTO Products (Title, Category, Price, Stock) VALUES
    ('PlayStation 5 Slim',    'Consolas',    899.99, 12),
    ('Nintendo Switch OLED',  'Consolas',    549.99, 20),
    ('DualSense PS5',         'Mandos',       79.99, 50),
    ('Logitech G Pro X',      'Auriculares', 129.99, 30),
    ('Razer Viper V2 Pro',    'Mouse',       149.99, 25),
    ('Corsair K70 RGB',       'Teclados',    169.99, 18);

/* ============================================================
   CONSULTAS DE EJEMPLO (las que ejecuta la aplicacion)
   ============================================================ */

-- Catalogo paginado con busqueda y filtro (equivale a GET /api/products)
-- SELECT * FROM Products
-- WHERE IsActive = 1
--   AND Title LIKE '%teclado%'
--   AND Category = 'Teclados'
-- ORDER BY Title
-- OFFSET 0 ROWS FETCH NEXT 12 ROWS ONLY;

-- Pedidos de un usuario con su detalle (equivale a GET /api/orders/mine)
-- SELECT o.OrderNumber, o.PlacedAtUtc, o.Total, i.ProductTitle, i.UnitPrice, i.Quantity
-- FROM Orders o
-- JOIN OrderItems i ON i.OrderId = o.Id
-- WHERE o.UserId = @UserId
-- ORDER BY o.PlacedAtUtc DESC;

-- Permisos efectivos de un rol (sin contar los heredados por jerarquia)
-- SELECT p.Code
-- FROM Roles r
-- JOIN RolePermissions rp ON rp.RoleId = r.Id
-- JOIN Permissions p      ON p.Id = rp.PermissionId
-- WHERE r.Name = 'Admin';
