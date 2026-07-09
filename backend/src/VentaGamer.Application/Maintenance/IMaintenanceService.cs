namespace VentaGamer.Application.Maintenance;

public interface IMaintenanceService
{
    Task<BackupResult> CreateBackupAsync(CancellationToken ct = default);
    Task<IReadOnlyList<BackupFileDto>> ListBackupsAsync(CancellationToken ct = default);
    Task<IntegrityReport> CheckIntegrityAsync(CancellationToken ct = default);
}

public record BackupResult(string FileName, string FilePath, long SizeBytes, DateTime CreatedAtUtc);
public record BackupFileDto(string FileName, string FilePath, long SizeBytes, DateTime CreatedAtUtc);

public record IntegrityReport(
    string ComputedAtUtc,
    int TotalRowsChecked,
    int Mismatches,
    IReadOnlyList<IntegrityFinding> Findings
);

public record IntegrityFinding(string Table, int RowId, string Reason);
