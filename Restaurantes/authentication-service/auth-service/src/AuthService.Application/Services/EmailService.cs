using AuthService.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace AuthService.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = _config.GetSection("SmtpSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtpSettings["FromName"], smtpSettings["FromEmail"]));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = body
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            var port = int.TryParse(smtpSettings["Port"], out var p) ? p : 587;
            await client.ConnectAsync(smtpSettings["Host"], port, SecureSocketOptions.SslOnConnect);
            await client.AuthenticateAsync(smtpSettings["Username"], smtpSettings["Password"]);
            await client.SendAsync(message);
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Error sending email: {ex.Message}");
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    // Keep the old method for compatibility, but make it async
    public void SendEmail(string to, string subject, string body)
    {
        SendEmailAsync(to, subject, body).Wait();
    }
}