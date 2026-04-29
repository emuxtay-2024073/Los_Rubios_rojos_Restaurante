namespace AuthService.Application.DTOs;

/// <summary>
/// Datos usados para registrar una nueva cuenta de usuario.
/// </summary>
public class RegisterDto
{
    /// <summary>Nombre de usuario único.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Correo electrónico del usuario.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Contraseña que el usuario desea usar.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>Rol del usuario. Si se omite, se asigna <c>USER</c>.</summary>
    public string Role { get; set; } = string.Empty;
}