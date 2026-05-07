using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> b)
    {
        b.ToTable("Users");
        b.HasKey(x => x.Id);

        b.Property(x => x.Username).IsRequired().HasMaxLength(60);
        b.Property(x => x.PasswordHash).IsRequired().HasMaxLength(500);

        b.HasIndex(x => x.Username).IsUnique();

        b.HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Language)
            .WithMany()
            .HasForeignKey(x => x.LanguageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
