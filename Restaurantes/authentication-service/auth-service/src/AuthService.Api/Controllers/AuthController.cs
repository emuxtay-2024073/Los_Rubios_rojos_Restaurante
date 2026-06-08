using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Utilities;
using AuthService.Domain.Interfaces;
using AuthService.Api.Infrastructure;
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
    private readonly IHtmlViewService _htmlViews;

    public AuthController(IAuthService auth, IUserRepository users, IConfiguration configuration, IHtmlViewService htmlViews)
    {
        _auth = auth;
        _users = users;
        _configuration = configuration;
        _htmlViews = htmlViews;
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

    [Authorize(Roles = RoleNames.SuperAdmin)]
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

    [Authorize(Roles = RoleNames.SuperAdmin)]
    [HttpPatch("users/{id}/role")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateUserRole([FromRoute] string id, [FromBody] UpdateUserRoleDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest(new AuthResponseDto { Success = false, Message = "El rol es requerido" });

        var result = await _auth.UpdateUserRole(id, dto.Role);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmailGet([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            var html = _htmlViews.GetErrorPage("El token es requerido.");
            return Content(html, "text/html");
        }

        var result = await _auth.VerifyEmail(token);

        if (result.Success)
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"];
            var html = _htmlViews.GetSuccessPage(result.Message ?? "Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.", frontendUrl);
            return Content(html, "text/html");
        }

        var failHtml = _htmlViews.GetErrorPage(result.Message ?? "No se pudo verificar el token.");
        return Content(failHtml, "text/html");
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
