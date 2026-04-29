namespace AuthService.Application.Interfaces;

public interface IEmailService
{
    void SendEmail(string to, string subject, string body);
    Task SendEmailAsync(string to, string subject, string body);
}