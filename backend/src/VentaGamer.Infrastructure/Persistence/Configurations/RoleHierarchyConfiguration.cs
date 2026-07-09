using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class RoleHierarchyConfiguration : IEntityTypeConfiguration<RoleHierarchy>
{
    public void Configure(EntityTypeBuilder<RoleHierarchy> b)
    {
        b.ToTable("RoleHierarchies");
        b.HasKey(x => new { x.ParentRoleId, x.ChildRoleId });

        b.HasOne(x => x.ParentRole)
            .WithMany(r => r.Children)
            .HasForeignKey(x => x.ParentRoleId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.ChildRole)
            .WithMany(r => r.Parents)
            .HasForeignKey(x => x.ChildRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
