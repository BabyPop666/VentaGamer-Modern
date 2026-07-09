using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class TranslationConfiguration : IEntityTypeConfiguration<Translation>
{
    public void Configure(EntityTypeBuilder<Translation> b)
    {
        b.ToTable("Translations");
        b.HasKey(x => x.Id);

        b.Property(x => x.TextKey).IsRequired().HasMaxLength(120);
        b.Property(x => x.Value).IsRequired().HasMaxLength(1000);

        b.HasOne(x => x.Language)
            .WithMany()
            .HasForeignKey(x => x.LanguageId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => new { x.LanguageId, x.TextKey }).IsUnique();
    }
}
