using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> Login(LoginDto dto);
    Task<AuthResponseDto> Register(RegisterDto dto);
    Task<AuthResponseDto> VerifyEmail(string token);
    Task<AuthResponseDto> ForgotPassword(string email);
    Task<AuthResponseDto> ResetPassword(string token, string newPassword);
}