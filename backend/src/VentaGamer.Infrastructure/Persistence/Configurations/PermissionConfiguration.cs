using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> b)
    {
        b.ToTable("Permissions");
        b.HasKey(x => x.Id);

        b.Property(x => x.Code).IsRequired().HasMaxLength(80);
        b.Property(x => x.Description).IsRequired().HasMaxLength(200);

        b.HasIndex(x => x.Code).IsUnique();
    }
}
