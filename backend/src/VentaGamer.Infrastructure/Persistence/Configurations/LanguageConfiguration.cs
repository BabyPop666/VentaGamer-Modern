using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> b)
    {
        b.ToTable("Languages");
        b.HasKey(x => x.Id);

        b.Property(x => x.Code).IsRequired().HasMaxLength(8);
        b.Property(x => x.Name).IsRequired().HasMaxLength(60);

        b.HasIndex(x => x.Code).IsUnique();
    }
}
