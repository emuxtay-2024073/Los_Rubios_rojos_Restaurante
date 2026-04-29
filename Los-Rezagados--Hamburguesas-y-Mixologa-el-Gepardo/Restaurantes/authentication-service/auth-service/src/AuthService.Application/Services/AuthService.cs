using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using BCrypt.Net;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;

    public AuthService(IUserRepository users, IJwtService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    // ========================= LOGIN =========================
    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        var user = await _users.GetByUsername(dto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return AuthResponseDto.Fail("Credenciales inválidas");

        if (!user.EmailConfirmed)
            return AuthResponseDto.Fail("Email no verificado");

        var token = _jwt.GenerateToken(user);

        return AuthResponseDto.SuccessResponse("Login exitoso", token);
    }

    // ========================= REGISTER =========================
    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return AuthResponseDto.Fail("Username, Email y Password son requeridos");
        }

        if (await _users.GetByUsername(dto.Username) != null)
            return AuthResponseDto.Fail("El usuario ya existe");

        if (await _users.GetByEmail(dto.Email) != null)
            return AuthResponseDto.Fail("El email ya está registrado");

        var verificationToken = Guid.NewGuid().ToString();

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = string.IsNullOrWhiteSpace(dto.Role) ? "USER" : dto.Role,
            EmailConfirmed = false,
            EmailVerificationToken = verificationToken
        };

        await _users.Add(user);

        return AuthResponseDto.SuccessResponse(
            "Registro exitoso. Usa este token para verificar tu email",
            verificationToken
        );
    }

    // ========================= VERIFY EMAIL =========================
    public async Task<AuthResponseDto> VerifyEmail(string token)
    {
        var user = await _users.GetByVerificationToken(token);

        if (user == null)
            return AuthResponseDto.Fail("Token inválido");

        user.EmailConfirmed = true;
        user.EmailVerificationToken = null;

        await _users.Update(user);

        return AuthResponseDto.SuccessResponse("Email verificado correctamente");
    }

    // ========================= FORGOT PASSWORD =========================
    public async Task<AuthResponseDto> ForgotPassword(string email)
    {
        var user = await _users.GetByEmail(email);

        if (user == null)
            return AuthResponseDto.Fail("Usuario no encontrado");

        user.PasswordResetToken = Guid.NewGuid().ToString();
        await _users.Update(user);

        return AuthResponseDto.SuccessResponse(
            "Token de recuperación generado",
            user.PasswordResetToken
        );
    }

    // ========================= RESET PASSWORD =========================
    public async Task<AuthResponseDto> ResetPassword(string token, string newPassword)
    {
        var user = await _users.GetByResetToken(token);

        if (user == null)
            return AuthResponseDto.Fail("Token inválido");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;

        await _users.Update(user);

        return AuthResponseDto.SuccessResponse("Contraseña actualizada");
    }
}