using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de autenticación. Contiene endpoints para login, registro, verificación de email y recuperación de contraseña.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    // ========================= LOGIN =========================
    /// <summary>
    /// Inicia sesión con credenciales válidas.
    /// </summary>
    /// <param name="dto">Nombre de usuario y contraseña.</param>
    /// <returns>Token JWT y mensaje de estado.</returns>
    /// <response code="200">Login exitoso, devuelve token.</response>
    /// <response code="401">Credenciales inválidas o email no verificado.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.Login(dto);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    // ========================= REGISTER =========================
    /// <summary>
    /// Registra un nuevo usuario con usuario, email y contraseña.
    /// </summary>
    /// <param name="dto">Datos del nuevo usuario.</param>
    /// <returns>Mensaje de éxito y token de verificación de correo.</returns>
    /// <response code="200">Registro exitoso.</response>
    /// <response code="400">Faltan datos o el usuario/email ya existe.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.Register(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ========================= VERIFY EMAIL =========================
    /// <summary>
    /// Verifica el correo electrónico del usuario usando un token enviado por email.
    /// </summary>
    /// <param name="token">Token de verificación.</param>
    /// <returns>Resultado de la verificación.</returns>
    /// <response code="200">Email verificado correctamente.</response>
    /// <response code="400">Token faltante o inválido.</response>
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

    // ========================= FORGOT PASSWORD =========================
    /// <summary>
    /// Solicita un token para recuperar la contraseña del email proporcionado.
    /// </summary>
    /// <param name="email">Email registrado.</param>
    /// <returns>Token de recuperación o mensaje de error.</returns>
    /// <response code="200">Token de recuperación generado.</response>
    /// <response code="400">Email inválido o no encontrado.</response>
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

    // ========================= RESET PASSWORD =========================
    /// <summary>
    /// Restablece la contraseña usando un token de recuperación y la nueva contraseña.
    /// </summary>
    /// <param name="token">Token de recuperación enviado por email.</param>
    /// <param name="newPassword">Nueva contraseña a establecer.</param>
    /// <returns>Resultado del proceso.</returns>
    /// <response code="200">Contraseña actualizada.</response>
    /// <response code="400">Faltan token o nueva contraseña.</response>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(
        [FromQuery] string token,
        [FromQuery] string newPassword)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            return BadRequest(new AuthResponseDto { Success = false, Message = "Token y nueva contraseña son requeridos" });

        var result = await _auth.ResetPassword(token, newPassword);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}