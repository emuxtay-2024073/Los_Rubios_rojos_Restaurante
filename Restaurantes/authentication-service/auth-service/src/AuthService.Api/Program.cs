using AuthService.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(builder.Configuration["AppSettings:BackendUrl"] ?? "http://127.0.0.1:5023");

// Add services to the container
builder.Services.AddControllers();
builder.Services
    .AddCustomCors(builder.Configuration)
    .AddCustomSwagger()
    .AddCustomDbContext(builder.Configuration)
    .AddCustomJwtAuthentication(builder.Configuration)
    .AddCustomRateLimiting()
    .AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Database initialization & seeding
await app.InitializeDatabaseAsync(builder.Configuration);

app.Lifetime.ApplicationStarted.Register(() =>
{
    var urls = string.Join(", ", app.Urls);
    if (string.IsNullOrWhiteSpace(urls))
    {
        urls = "http://localhost:5023";
    }

    Console.WriteLine($"[API] Ruta disponible: {urls}");
    Console.WriteLine("[API] Todo listo");
});

// Configure middleware pipeline
app.UseCustomMiddleware();

app.Run();
