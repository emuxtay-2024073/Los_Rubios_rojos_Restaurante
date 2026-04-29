/// <summary>
/// Datos necesarios para iniciar sesión en el sistema.
/// </summary>
public class LoginDto
{
    /// <summary>Correo electrónico registrado.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Contraseña asociada al usuario.</summary>
    public string Password { get; set; } = string.Empty;
}