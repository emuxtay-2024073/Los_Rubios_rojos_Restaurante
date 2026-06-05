namespace AuthService.Domain.Entities;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "CLIENTE";
    public string? PendingRole { get; set; }
    public bool EmailConfirmed { get; set; } = false;
    public string? EmailVerificationToken { get; set; }
    public string? AdminActivationToken { get; set; }
    public DateTime? AdminActivationTokenExpiresAt { get; set; }
    public DateTime? AdminActivationRequestedAt { get; set; }
    public string? AdminActivationRequestedBy { get; set; }
    public string? PasswordResetToken { get; set; }
}
