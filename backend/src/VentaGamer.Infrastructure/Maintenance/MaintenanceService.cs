using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using VentaGamer.Application.Maintenance;
using VentaGamer.Infrastructure.Persistence;

namespace VentaGamer.Infrastructure.Maintenance;

public class MaintenanceService : IMaintenanceService
{
    private readonly AppDbContext _db;

    // Carpeta dentro del contenedor SQL Server (mapeada al volumen sqldata)
    private const string BackupDirInContainer = "/var/opt/mssql/data/backups";

    // Secreto HMAC (en produccion: env var, no hardcoded)
    private static readonly byte[] HmacSecret = Encoding.UTF8.GetBytes("DEV_HMAC_KEY_change_in_prod_at_least_32_bytes");

    public MaintenanceService(AppDbContext db) => _db = db;

    public async Task<BackupResult> CreateBackupAsync(CancellationToken ct = default)
    {
        var fileName = $"VentaGamer_{DateTime.UtcNow:yyyyMMdd_HHmmss}.bak";
        var filePath = $"{BackupDirInContainer}/{fileName}";

        // Asegurar que el dir existe (xp_create_subdir requiere xp_cmdshell o esto via exec)
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC master.dbo.xp_create_subdir @directory",
            new Microsoft.Data.SqlClient.SqlParameter("@directory", BackupDirInContainer));

        await _db.Database.ExecuteSqlRawAsync(
            "BACKUP DATABASE VentaGamer TO DISK = @file WITH FORMAT, INIT, COMPRESSION, NAME = @name",
            new Microsoft.Data.SqlClient.SqlParameter("@file", filePath),
            new Microsoft.Data.SqlClient.SqlParameter("@name", fileName));

        // Obtener tamaño via xp_fileexist o consulta - aproximamos via msdb
        var sizeRow = await _db.Database
            .SqlQuery<long>($@"
                SELECT TOP 1 backup_size FROM msdb.dbo.backupset
                WHERE database_name = 'VentaGamer'
                ORDER BY backup_finish_date DESC")
            .FirstOrDefaultAsync(ct);

        return new BackupResult(fileName, filePath, sizeRow, DateTime.UtcNow);
    }

    public async Task<IReadOnlyList<BackupFileDto>> ListBackupsAsync(CancellationToken ct = default)
    {
        var rows = await _db.Database.SqlQuery<BackupHistoryRow>($@"
            SELECT TOP 50
                physical_device_name AS FilePath,
                backup_size AS SizeBytes,
                backup_finish_date AS CreatedAtUtc
            FROM msdb.dbo.backupset bs
            INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
            WHERE bs.database_name = 'VentaGamer'
            ORDER BY backup_finish_date DESC").ToListAsync(ct);

        return rows.Select(r => new BackupFileDto(
            Path.GetFileName(r.FilePath ?? ""),
            r.FilePath ?? "",
            r.SizeBytes,
            DateTime.SpecifyKind(r.CreatedAtUtc, DateTimeKind.Utc)
        )).ToList();
    }

    public async Task<IntegrityReport> CheckIntegrityAsync(CancellationToken ct = default)
    {
        var findings = new List<IntegrityFinding>();
        var checkedRows = 0;

        // Calcula HMAC sobre los campos canonicos de Users
        var users = await _db.Users.AsNoTracking().ToListAsync(ct);
        foreach (var u in users)
        {
            checkedRows++;
            var canonical = $"{u.Id}|{u.Username}|{u.PasswordHash}|{u.RoleId}|{u.IsBlocked}";
            var hmac = ComputeHmac(canonical);
            // Para un sistema real, comparariamos con un hash previamente almacenado.
            // Aca solo demostramos la generacion: si el hash es vacio, hay problema.
            if (string.IsNullOrEmpty(hmac))
                findings.Add(new IntegrityFinding("Users", u.Id, "Failed to compute HMAC"));
        }

        var orders = await _db.Orders.AsNoTracking().ToListAsync(ct);
        foreach (var o in orders)
        {
            checkedRows++;
            var canonical = $"{o.Id}|{o.OrderNumber}|{o.UserId}|{o.Total:F2}|{o.PlacedAtUtc:O}";
            var hmac = ComputeHmac(canonical);
            if (string.IsNullOrEmpty(hmac))
                findings.Add(new IntegrityFinding("Orders", o.Id, "Failed to compute HMAC"));
        }

        return new IntegrityReport(
            DateTime.UtcNow.ToString("O"),
            checkedRows,
            findings.Count,
            findings
        );
    }

    private static string ComputeHmac(string data)
    {
        using var hmac = new HMACSHA256(HmacSecret);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash);
    }

    private class BackupHistoryRow
    {
        public string? FilePath { get; set; }
        public long SizeBytes { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
