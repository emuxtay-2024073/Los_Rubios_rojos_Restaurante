namespace AuthService.Application.DTOs;

public class AuthResponseDto
{
    /// <summary>Indica si la operación fue exitosa.</summary>
    public bool Success { get; set; }

    /// <summary>Mensaje legible que explica el resultado.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>JWT devuelto en respuestas de login válidas.</summary>
    public string? Token { get; set; }

    public static AuthResponseDto SuccessResponse(string message, string? token = null)
    {
        return new AuthResponseDto
        {
            Success = true,
            Message = message,
            Token = token
        };
    }

    public static AuthResponseDto Fail(string message)
    {
        return new AuthResponseDto
        {
            Success = false,
            Message = message
        };
    }
}