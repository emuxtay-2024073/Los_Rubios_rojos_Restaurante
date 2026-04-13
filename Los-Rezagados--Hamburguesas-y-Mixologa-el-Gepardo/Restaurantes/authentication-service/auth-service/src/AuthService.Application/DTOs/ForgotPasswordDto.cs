namespace AuthService.Application.DTOs;

/// <summary>
/// Información usada para solicitar un token de recuperación de contraseña.
/// </summary>
public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}