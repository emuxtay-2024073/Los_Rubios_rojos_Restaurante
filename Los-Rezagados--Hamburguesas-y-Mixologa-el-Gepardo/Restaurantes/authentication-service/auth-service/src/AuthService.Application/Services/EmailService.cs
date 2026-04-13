using AuthService.Application.Interfaces;

namespace AuthService.Application.Services;

public class EmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        
        Console.WriteLine("----- EMAIL -----");
        Console.WriteLine($"To: {to}");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine(body);
        Console.WriteLine("-----------------");
    }
}