/// <summary>
/// Datos necesarios para iniciar sesión en el sistema.
/// </summary>
public class LoginDto
{
    /// <summary>Nombre de usuario registrado.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Contraseña asociada al usuario.</summary>
    public string Password { get; set; } = string.Empty;
}