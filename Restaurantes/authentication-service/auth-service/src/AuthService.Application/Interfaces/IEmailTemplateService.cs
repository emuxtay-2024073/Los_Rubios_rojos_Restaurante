namespace AuthService.Application.Interfaces;

public interface IEmailTemplateService
{
    string GetEmailVerificationBody(string username, string verificationUrl);
}
