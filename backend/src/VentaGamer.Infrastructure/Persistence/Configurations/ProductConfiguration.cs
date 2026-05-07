using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products");
        b.HasKey(x => x.Id);

        b.Property(x => x.Title).IsRequired().HasMaxLength(200);
        b.Property(x => x.Category).IsRequired().HasMaxLength(80);
        b.Property(x => x.Price).HasColumnType("decimal(18,2)");
        b.Property(x => x.ImageUrl).HasMaxLength(500);

        b.HasIndex(x => x.Title);
        b.HasIndex(x => x.Category);
        b.HasIndex(x => x.IsActive);
    }
}
