namespace AuthService.Application.Utilities;

public static class RoleNames
{
    public const string Cliente = "CLIENTE";
    public const string Admin = "ADMIN";
    public const string AdminSecret = "CLAVE_ADMIN";

    public static string? Normalize(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        return role.Trim().ToLowerInvariant() switch
        {
            "cliente" => Cliente,
            "user" => Cliente,
            "user_role" => Cliente, 
            "adminrestaurante" => Admin,
            "admin" => Admin,
            _ => null
        };
    }

    public static bool IsValidAdminSecret(string? secretKey)
    {
        return string.Equals(secretKey?.Trim(), AdminSecret, StringComparison.Ordinal);
    }
}