using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VentaGamer.Application.Orders;

namespace VentaGamer.Infrastructure.Orders;

public class OrderPdfGenerator
{
    static OrderPdfGenerator()
    {
        // Licencia Community (gratis para uso comercial bajo ciertos limites)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] Generate(OrderDto order)
    {
        var doc = Document.Create(c =>
        {
            c.Page(p =>
            {
                p.Size(PageSizes.A4);
                p.Margin(40);
                p.DefaultTextStyle(t => t.FontSize(11).FontFamily("Helvetica"));

                p.Header().Element(BuildHeader);
                p.Content().Element(e => BuildContent(e, order));
                p.Footer().AlignCenter().Text(t =>
                {
                    t.Span("VentaGamer - Comprobante generado automaticamente. ");
                    t.CurrentPageNumber();
                    t.Span(" / ");
                    t.TotalPages();
                });

                static void BuildHeader(QuestPDF.Infrastructure.IContainer c) =>
                    c.PaddingBottom(20)
                     .BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                     .Row(row =>
                     {
                         row.RelativeItem().Column(col =>
                         {
                             col.Item().Text("VentaGamer").FontSize(22).Bold().FontColor("#1e3a8a");
                             col.Item().Text("Tu tienda gaming").FontSize(10).FontColor(Colors.Grey.Darken1);
                         });
                         row.ConstantItem(150).AlignRight().Column(col =>
                         {
                             col.Item().AlignRight().Text("COMPROBANTE").FontSize(14).Bold();
                             col.Item().AlignRight().Text(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm 'UTC'")).FontSize(9);
                         });
                     });
            });
        });

        return doc.GeneratePdf();
    }

    private static void BuildContent(QuestPDF.Infrastructure.IContainer container, OrderDto order)
    {
        container.PaddingVertical(20).Column(col =>
        {
            col.Spacing(15);

            col.Item().Row(r =>
            {
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Numero de orden").FontSize(9).FontColor(Colors.Grey.Darken1);
                    c.Item().Text(order.OrderNumber).Bold();
                });
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Cliente").FontSize(9).FontColor(Colors.Grey.Darken1);
                    c.Item().Text(order.CustomerUsername).Bold();
                });
                r.RelativeItem().Column(c =>
                {
                    c.Item().Text("Fecha").FontSize(9).FontColor(Colors.Grey.Darken1);
                    c.Item().Text(order.PlacedAtUtc.ToString("yyyy-MM-dd HH:mm 'UTC'")).Bold();
                });
            });

            col.Item().Table(t =>
            {
                t.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(5);
                    c.RelativeColumn(2);
                    c.RelativeColumn(2);
                    c.RelativeColumn(2);
                });

                t.Header(h =>
                {
                    h.Cell().Background("#1e3a8a").Padding(8).Text("Producto").FontColor(Colors.White).Bold();
                    h.Cell().Background("#1e3a8a").Padding(8).AlignRight().Text("P. Unitario").FontColor(Colors.White).Bold();
                    h.Cell().Background("#1e3a8a").Padding(8).AlignCenter().Text("Cant.").FontColor(Colors.White).Bold();
                    h.Cell().Background("#1e3a8a").Padding(8).AlignRight().Text("Subtotal").FontColor(Colors.White).Bold();
                });

                foreach (var item in order.Items)
                {
                    t.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Text(item.ProductTitle);
                    t.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).AlignRight().Text($"${item.UnitPrice:F2}");
                    t.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).AlignCenter().Text(item.Quantity.ToString());
                    t.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).AlignRight().Text($"${item.LineTotal:F2}");
                }
            });

            col.Item().AlignRight().Column(c =>
            {
                c.Spacing(2);
                c.Item().Text(t =>
                {
                    t.Span("TOTAL: ").FontSize(13).Bold();
                    t.Span($"${order.Total:F2}").FontSize(16).Bold().FontColor("#1e3a8a");
                });
                c.Item().Text($"{order.Items.Sum(i => i.Quantity)} producto(s)").FontSize(9).FontColor(Colors.Grey.Darken1);
            });
        });
    }
}
