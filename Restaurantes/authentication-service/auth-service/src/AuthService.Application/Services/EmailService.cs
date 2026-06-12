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

        var fromName = smtpSettings["FromName"];
        var fromEmail = smtpSettings["FromEmail"];
        var host = smtpSettings["Host"];
        var username = smtpSettings["Username"];
        var password = smtpSettings["Password"];

        if (string.IsNullOrWhiteSpace(fromEmail))
            throw new InvalidOperationException("SmtpSettings:FromEmail is required.");
        if (string.IsNullOrWhiteSpace(to))
            throw new ArgumentException("Destination email address is required.", nameof(to));
        if (string.IsNullOrWhiteSpace(host))
            throw new InvalidOperationException("SmtpSettings:Host is required.");
        if (string.IsNullOrWhiteSpace(username))
            throw new InvalidOperationException("SmtpSettings:Username is required.");
        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("SmtpSettings:Password is required.");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName ?? string.Empty, fromEmail));
        message.To.Add(new MailboxAddress(string.Empty, to));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = body }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            var port = int.TryParse(smtpSettings["Port"], out var p) ? p : 587;
            var useImplicitSsl = bool.TryParse(smtpSettings["UseImplicitSsl"], out var implicitSsl)
                ? implicitSsl
                : port == 465;
            var enableSsl = bool.TryParse(smtpSettings["EnableSsl"], out var enableSslValue) && enableSslValue;
            var ignoreCertificateErrors = bool.TryParse(smtpSettings["IgnoreCertificateErrors"], out var ignoreCert) && ignoreCert;

            if (ignoreCertificateErrors)
            {
                client.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
            }

            var socketOptions = useImplicitSsl
                ? SecureSocketOptions.SslOnConnect
                : enableSsl
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.None;

            await client.ConnectAsync(host, port, socketOptions);
            await client.AuthenticateAsync(username, password);
            await client.SendAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email: {ex.Message}");
            throw;
        }
        finally
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true);
            }
        }
    }

    public void SendEmail(string to, string subject, string body)
    {
        SendEmailAsync(to, subject, body).Wait();
    }
}
