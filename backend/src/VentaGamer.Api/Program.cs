using Microsoft.Extensions.DependencyInjection;
using VentaGamer.Infrastructure;
using VentaGamer.Infrastructure.Persistence;
using VentaGamer.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "FrontendDev";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "VentaGamer API", Version = "v1" });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");
    await DbSeeder.SeedAsync(db, logger);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VentaGamer API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors(CorsPolicyName);
app.UseAuthorization();
app.MapControllers();

app.Run();
