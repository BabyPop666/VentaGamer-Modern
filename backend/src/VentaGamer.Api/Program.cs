using VentaGamer.Infrastructure;

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
