using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Application.Utilities;
using BCrypt.Net;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;

    public AuthService(IUserRepository users, IJwtService jwt, IEmailService email)
    {
        _users = users;
        _jwt = jwt;
        _email = email;
    }

    // ========================= LOGIN =========================
    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return AuthResponseDto.Fail("Email y contraseña son requeridos");

        var user = await _users.GetByEmail(dto.Email);

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

        var role = RoleNames.Normalize(string.IsNullOrWhiteSpace(dto.Role) ? RoleNames.Cliente : dto.Role);

        if (role == null)
            return AuthResponseDto.Fail("El rol solo puede ser cliente o admin");

        if (role == RoleNames.Admin && !RoleNames.IsValidAdminSecret(dto.SecretKey))
            return AuthResponseDto.Fail("Se necesita la clave secreta para ser admin");

        var verificationToken = Guid.NewGuid().ToString();

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            EmailConfirmed = false,
            EmailVerificationToken = verificationToken
        };

        await _users.Add(user);

        // Send verification email
        var verificationUrl = $"http://localhost:5022/auth/verify-email?token={verificationToken}";
        var emailBody = $@"
        <h2>Verificación de Email</h2>
        <p>Hola {user.Username},</p>
        <p>Gracias por registrarte. Para verificar tu email, haz clic en el siguiente enlace:</p>
        <a href='{verificationUrl}'>Verificar Email</a>
        <p>Si no puedes hacer clic, copia y pega esta URL en tu navegador: {verificationUrl}</p>
        <p>Saludos,<br>Sistema de Autenticación RestauranteRR</p>
        ";

        try
        {
            await _email.SendEmailAsync(user.Email, "Verifica tu email - RestauranteRR", emailBody);
        }
        catch (Exception ex)
        {
            // Log error, but don't fail registration
            Console.WriteLine($"Error sending email: {ex.Message}");
        }

        return AuthResponseDto.SuccessResponse(
            "Registro exitoso. Revisa tu email para verificar tu cuenta.",
            null
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