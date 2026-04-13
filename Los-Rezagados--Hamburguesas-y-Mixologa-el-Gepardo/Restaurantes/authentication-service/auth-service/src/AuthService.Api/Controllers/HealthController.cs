using AuthService.Persistence.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

/// <summary>
/// Endpoint de salud del servicio, usado para comprobación de disponibilidad.
/// </summary>
[ApiController]
[Route("api/health")]
[Produces("application/json")]
public class HealthController(ApplicationDbContext dbContext) : ControllerBase
{
    /// <summary>
    /// Verifica si el API responde y si la base de datos PostgreSQL está disponible.
    /// </summary>
    /// <returns>Estado de salud de la API y la base de datos.</returns>
    /// <response code="200">Servicio saludable.</response>
    /// <response code="503">Fallo de conexión con la base de datos.</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Check()
    {
        var dbStatus = "Unhealthy";

        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            dbStatus = canConnect ? "Healthy" : "Unhealthy";
        }
        catch
        {
            dbStatus = "Unhealthy";
        }

        var response = new
        {
            success = dbStatus == "Healthy",
            status = new
            {
                api = "Healthy",
                database = dbStatus,
                timestamp = DateTime.UtcNow
            }
        };

        return dbStatus == "Healthy"
            ? Ok(response)
            : StatusCode(503, response);
    }
}