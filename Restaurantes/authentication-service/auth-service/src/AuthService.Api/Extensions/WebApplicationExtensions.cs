using AuthService.Api.Middlewares;
using AuthService.Api.Infrastructure;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseCustomMiddleware(this WebApplication app)
    {
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

        return app;
    }

    public static async Task InitializeDatabaseAsync(this WebApplication app, IConfiguration configuration)
    {
        using var scope = app.Services.CreateScope();
        try
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.Migrate();

            Console.WriteLine("[DB] Base de datos conectada correctamente");

            await DefaultAdminSeeder.SeedAsync(scope.ServiceProvider, configuration);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] No se pudo inicializar la base de datos: {ex.Message}");
            Console.WriteLine("[DB] Continuando en modo degradado. Algunos endpoints pueden no funcionar correctamente.");
        }
    }
}
