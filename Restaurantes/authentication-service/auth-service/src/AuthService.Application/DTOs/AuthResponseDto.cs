namespace AuthService.Application.DTOs;

public class AuthResponseDto
{
    /// <summary>Indica si la operacion fue exitosa.</summary>
    public bool Success { get; set; }

    /// <summary>Mensaje legible que explica el resultado.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>JWT devuelto en respuestas de login validas.</summary>
    public string? Token { get; set; }

    /// <summary>Indica si el correo transaccional fue enviado correctamente.</summary>
    public bool? EmailSent { get; set; }

    /// <summary>Link de verificacion expuesto solo para desarrollo o fallback.</summary>
    public string? VerificationUrl { get; set; }

    public static AuthResponseDto SuccessResponse(
        string message,
        string? token = null,
        bool? emailSent = null,
        string? verificationUrl = null)
    {
        return new AuthResponseDto
        {
            Success = true,
            Message = message,
            Token = token,
            EmailSent = emailSent,
            VerificationUrl = verificationUrl
        };
    }

    public static AuthResponseDto Fail(string message, string? verificationUrl = null)
    {
        return new AuthResponseDto
        {
            Success = false,
            Message = message,
            VerificationUrl = verificationUrl
        };
    }
}
