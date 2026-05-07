using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VentaGamer.Domain.Entities;

namespace VentaGamer.Infrastructure.Persistence.Configurations;

public class AiMessageConfiguration : IEntityTypeConfiguration<AiMessage>
{
    public void Configure(EntityTypeBuilder<AiMessage> b)
    {
        b.ToTable("AiMessages");
        b.HasKey(x => x.Id);

        b.Property(x => x.Role).HasConversion<int>();
        b.Property(x => x.Content).IsRequired();
        b.Property(x => x.ToolName).HasMaxLength(80);

        b.HasIndex(x => new { x.ConversationId, x.CreatedAtUtc });
    }
}
