namespace AuthService.Api.Infrastructure;

public interface IHtmlViewService
{
    string GetSuccessPage(string message, string? frontendUrl);
    string GetErrorPage(string message);
}
