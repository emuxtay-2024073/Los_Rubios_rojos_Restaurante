using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

/// <summary>
/// Endpoints de administración y control de acceso protegido.
/// </summary>
[ApiController]
[Route("api/management")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    /// <summary>
    /// Devuelve información del usuario actualmente autenticado.
    /// </summary>
    /// <returns>Claims del token JWT del usuario.</returns>
    /// <response code="200">Usuario autenticado correctamente.</response>
    /// <response code="401">Token JWT faltante o inválido.</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var username = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName);
        var role = User.FindFirstValue("role");

        return Ok(new
        {
            success = true,
            sub,
            username,
            role
        });
    }

    /// <summary>
    /// Endpoint exclusivo para usuarios con rol <c>adminRestaurante</c>.
    /// </summary>
    /// <returns>Mensaje de acceso autorizado.</returns>
    /// <response code="200">Usuario con rol válido.</response>
    /// <response code="401">Token JWT faltante o inválido.</response>
    /// <response code="403">Usuario autenticado pero sin rol permitido.</response>
    [Authorize(Roles = "adminRestaurante")]
    [HttpGet("only-admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult OnlyAdmin()
    {
        return Ok(new { success = true, message = "Acceso permitido: admin" });
    }
}
