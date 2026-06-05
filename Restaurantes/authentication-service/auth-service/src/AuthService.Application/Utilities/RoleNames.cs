namespace AuthService.Application.Utilities;

public static class RoleNames
{
    public const string User = "USER";
    public const string Admin = "ADMIN";
    public const string SuperAdmin = "SUPER_ADMIN";

    public static string? Normalize(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        return role.Trim().ToUpperInvariant() switch
        {
            "CLIENTE" => User,
            "USER" => User,
            "USER_ROLE" => User,
            "ADMIN" => Admin,
            "SUPER_ADMIN" => SuperAdmin,
            "SUPERADMIN" => SuperAdmin,
            "SUPER ADMIN" => SuperAdmin,
            _ => null
        };
    }
}
