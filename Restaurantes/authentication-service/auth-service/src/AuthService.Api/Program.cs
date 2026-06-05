using AuthService.Application.Interfaces;
using AuthService.Application.Services;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using AuthService.Persistence.Repositories;
using AuthService.Api.Middlewares;
using AuthService.Api.Swagger;
using AuthService.Api.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(builder.Configuration["AppSettings:BackendUrl"] ?? "http://127.0.0.1:5023");

// ====================
// Controllers & Swagger
// ====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var allowedOrigins = builder.Configuration
    .GetSection("Security:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin) || !Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase)
                    || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Restaurant Authentication API",
        Version = "v1",
        Description = "Servicio de autenticación para el Sistema de Gestión de Restaurantes"
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    options.TagActionsBy(api =>
    {
        var controllerName = api.ActionDescriptor.RouteValues["controller"];
        return new[] { controllerName ?? "General" };
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    options.OperationFilter<AuthExamplesOperationFilter>();
    options.SchemaFilter<AuthExamplesSchemaFilter>();
});

// ====================
// Database (PostgreSQL)
// ====================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsAssembly("AuthService.Persistence")
    );
});

// ====================
// JWT Configuration
// ====================
var jwtConfig = builder.Configuration.GetSection("Jwt");

var key = jwtConfig["Key"]!;
var issuer = jwtConfig["Issuer"]!;
var audience = jwtConfig["Audience"]!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = "role",
            NameClaimType = JwtRegisteredClaimNames.UniqueName
        };
    });

builder.Services.AddAuthorization();

// ====================
// Rate Limiting
// ====================
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("ApiPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromSeconds(60),
                QueueLimit = 2
            }));
});

// ====================
// Dependency Injection
// ====================
builder.Services.AddScoped<IUserRepository, UserRepository>(); // 🔥 EF CORE
builder.Services.AddScoped<IJwtService>(sp =>
{
    var expires = int.TryParse(jwtConfig["ExpiresMinutes"], out var m) ? m : 60;
    return new JwtService(key, issuer, audience, expires);
});

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService.Application.Services.AuthService>();

// ====================
// App Pipeline
// ====================
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();

        Console.WriteLine("[DB] Base de datos conectada correctamente");

        await DefaultAdminSeeder.SeedAsync(scope.ServiceProvider, builder.Configuration);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB] No se pudo inicializar la base de datos: {ex.Message}");
        Console.WriteLine("[DB] Continuando en modo degradado. Algunos endpoints pueden no funcionar correctamente.");
    }
}

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

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Restaurant Authentication API v1");
    options.RoutePrefix = string.Empty;
    options.DefaultModelsExpandDepth(-1);
});

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("FrontendCors");

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
