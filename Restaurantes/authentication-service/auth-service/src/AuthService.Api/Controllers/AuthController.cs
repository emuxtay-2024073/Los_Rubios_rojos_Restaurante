using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Utilities;
using AuthService.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IUserRepository _users;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService auth, IUserRepository users, IConfiguration configuration)
    {
        _auth = auth;
        _users = users;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.Login(dto);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.Register(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _users.GetAll();

        return Ok(new
        {
            users = users.Select(user => ToUserResponse(user))
        });
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPatch("users/{id}/promote")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> PromoteUserToAdmin([FromRoute] string id)
    {
        var requestedBy = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var result = await _auth.RequestAdminActivation(id, requestedBy);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmailGet([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            var errorIcon = "<div class=\"icon error\">✕</div>";
            return Content(GetHtmlPage("Error de verificación", "El token es requerido.", errorIcon), "text/html");
        }

        var result = await _auth.VerifyEmail(token);

        if (result.Success)
        {
            var successIcon = "<div class=\"icon success\">✓</div>";
            var body = result.Message ?? "Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.";
            return Content(GetHtmlPage("¡Verificación exitosa!", body, $"{successIcon}{GetFrontendLoginLink()}"), "text/html");
        }

        var failIcon = "<div class=\"icon error\">✕</div>";
        return Content(GetHtmlPage("Error al verificar el correo", result.Message ?? "No se pudo verificar el token.", failIcon), "text/html");
    }

    [HttpPost("verify-email")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new AuthResponseDto { Success = false, Message = "El token es requerido" });

        var result = await _auth.VerifyEmail(token);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("activate-admin")]
    public async Task<IActionResult> ActivateAdminGet([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            var errorIcon = "<div class=\"icon error\">✕</div>";
            return Content(GetHtmlPage("Error de activación", "El token es requerido.", errorIcon), "text/html");
        }

        var result = await _auth.ActivateAdminRole(token);

        if (result.Success)
        {
            var successIcon = "<div class=\"icon success\">✓</div>";
            var body = result.Message ?? "Tu rol de administrador ha sido activado correctamente. Puedes iniciar sesión ahora.";
            return Content(GetHtmlPage("¡Admin activado!", body, $"{successIcon}{GetFrontendLoginLink()}"), "text/html");
        }

        var failIcon = "<div class=\"icon error\">✕</div>";
        return Content(GetHtmlPage("Error al activar admin", result.Message ?? "No se pudo activar el rol de admin.", failIcon), "text/html");
    }

    [HttpPost("activate-admin")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivateAdminRole([FromQuery] string token)
    {
        var result = await _auth.ActivateAdminRole(token);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new AuthResponseDto { Success = false, Message = "El email es requerido" });

        var result = await _auth.ForgotPassword(email);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromQuery] string token, [FromQuery] string newPassword)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            return BadRequest(new AuthResponseDto { Success = false, Message = "Token y nueva contrasena son requeridos" });

        var result = await _auth.ResetPassword(token, newPassword);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    private string GetFrontendLoginLink()
    {
        var frontendUrl = _configuration["AppSettings:FrontendUrl"];
        if (string.IsNullOrWhiteSpace(frontendUrl))
        {
            return string.Empty;
        }

        frontendUrl = frontendUrl.TrimEnd('/');
        return $"<script>var redirectUrl = '{frontendUrl}/login'; var countdown = 4; function redirect() {{ if (countdown > 0) {{ document.getElementById('countdown').innerText = countdown; countdown--; setTimeout(redirect, 1000); }} else {{ window.location.href = redirectUrl; }} }} window.onload = function() {{ redirect(); }};</script><div id=\"redirectContainer\" style=\"text-align:center;margin-top:24px;\"><p style=\"margin:0 0 16px;font-size:14px;color:#666;\">Te llevaremos al inicio de sesión en <span id=\"countdown\" style=\"font-weight:bold;font-size:18px;color:#a91010;\">4</span> segundos...</p><a href=\"{frontendUrl}/login\" style=\"display:inline-block;background:#a91010;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;transition:background 0.3s;\">Ir ahora al login</a></div>";
    }

    private static string GetHtmlPage(string title, string body, string actionButtonHtml = "")
    {
        var html = $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{title}</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #fff9ee 0%, #f7dfb8 48%, #fff3db 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }}
    .container {{
      max-width: 520px;
      width: 100%;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
      padding: 48px 32px;
      text-align: center;
      animation: slideUp 0.6s ease-out;
    }}
    @keyframes slideUp {{
      from {{ transform: translateY(30px); opacity: 0; }}
      to {{ transform: translateY(0); opacity: 1; }}
    }}
    .icon {{
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      animation: scaleIn 0.6s ease-out;
    }}
    @keyframes scaleIn {{
      from {{ transform: scale(0.8); opacity: 0; }}
      to {{ transform: scale(1); opacity: 1; }}
    }}
    .icon.success {{
      background: #d1fae5;
      color: #059669;
    }}
    .icon.error {{
      background: #fee2e2;
      color: #dc2626;
    }}
    h1 {{
      font-size: 28px;
      color: #1f2937;
      margin-bottom: 16px;
      font-weight: 700;
    }}
    h1.success {{ color: #059669; }}
    h1.error {{ color: #dc2626; }}
    .body {{
      font-size: 16px;
      line-height: 1.75;
      color: #4b5563;
      margin-bottom: 28px;
    }}
    .logo {{
      margin-bottom: 24px;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 800;
      color: #a91010;
    }}
    #redirectContainer {{
      margin-top: 24px;
    }}
    #countdown {{
      font-weight: bold;
      font-size: 20px;
      color: #a91010;
    }}
  </style>
</head>
<body>
  <div class=""container"">
    <div class=""logo"">Los Rubios Rojos</div>
    {actionButtonHtml}
    <div class=""body"">{body}</div>
  </div>
</body>
</html>";
        return html;
    }

    private static UserResponseDto ToUserResponse(AuthService.Domain.Entities.User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            EmailConfirmed = user.EmailConfirmed
        };
    }
}
