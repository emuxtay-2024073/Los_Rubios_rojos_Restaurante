namespace AuthService.Application.Utilities;

public static class RoleNames
{
    public const string Cliente = "CLIENTE";
    public const string Admin = "ADMIN";
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

    public static bool IsValidAdminSecret(string? secretKey, string? expectedSecret)
    {
        return !string.IsNullOrWhiteSpace(expectedSecret) &&
            string.Equals(secretKey?.Trim(), expectedSecret.Trim(), StringComparison.Ordinal);
    }
}
