using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Utilities;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AuthService.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository users, IJwtService jwt, IEmailService email, IEmailTemplateService emailTemplateService, IConfiguration configuration)
    {
        _users = users;
        _jwt = jwt;
        _email = email;
        _emailTemplateService = emailTemplateService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return AuthResponseDto.Fail("Email y password son requeridos");

        var user = await _users.GetByEmail(dto.Email.Trim());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return AuthResponseDto.Fail("Credenciales invalidas");

        if (!user.EmailConfirmed)
        {
            var exposeVerificationLink =
                bool.TryParse(_configuration["AppSettings:ExposeVerificationLink"], out var exposeLink) && exposeLink;
            var verificationUrl =
                exposeVerificationLink && !string.IsNullOrWhiteSpace(user.EmailVerificationToken)
                    ? $"{NormalizeBackendUrl(_configuration["AppSettings:BackendUrl"])}/api/auth/verify-email?token={user.EmailVerificationToken}"
                    : null;

            return AuthResponseDto.Fail(
                "Email no verificado. Verifica tu cuenta antes de iniciar sesion.",
                verificationUrl
            );
        }

        var token = _jwt.GenerateToken(user);

        return AuthResponseDto.SuccessResponse("Login exitoso", token);
    }

    public async Task<AuthResponseDto> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return AuthResponseDto.Fail("Username, email y password son requeridos");
        }

        var username = dto.Username.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();

        if (await _users.GetByUsername(username) != null)
            return AuthResponseDto.Fail($"El nombre de usuario '{username}' ya existe");

        if (await _users.GetByEmail(email) != null)
            return AuthResponseDto.Fail($"El email '{email}' ya esta registrado");

        var verificationToken = Guid.NewGuid().ToString();

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = RoleNames.User,
            EmailConfirmed = false,
            EmailVerificationToken = verificationToken
        };

        await _users.Add(user);

        var backendUrl = NormalizeBackendUrl(_configuration["AppSettings:BackendUrl"]);
        var verificationUrl = $"{backendUrl}/api/auth/verify-email?token={verificationToken}";
        var emailBody = _emailTemplateService.GetEmailVerificationBody(user.Username, verificationUrl);

        var emailSent = true;
        try
        {
            await _email.SendEmailAsync(user.Email, "Verifica tu email - RestauranteRR", emailBody);
        }
        catch (Exception ex)
        {
            emailSent = false;
            Console.WriteLine($"Error sending email: {ex.Message}");
        }

        var exposeVerificationLink =
            bool.TryParse(_configuration["AppSettings:ExposeVerificationLink"], out var exposeLink) && exposeLink;
        var shouldReturnVerificationUrl = exposeVerificationLink || !emailSent;
        var responseMessage = emailSent
            ? "Registro exitoso. Revisa tu correo para verificar tu cuenta antes de iniciar sesion."
            : "Registro exitoso, pero no se pudo enviar el correo. Usa el enlace de verificacion mostrado en pantalla.";

        return AuthResponseDto.SuccessResponse(
            responseMessage,
            null,
            emailSent,
            shouldReturnVerificationUrl ? verificationUrl : null
        );
    }

    public async Task<AuthResponseDto> VerifyEmail(string token)
    {
        var user = await _users.GetByVerificationToken(token);

        if (user == null)
            return AuthResponseDto.Fail("Token invalido");

        var activationMessage = "Email verificado correctamente.";
        user.EmailConfirmed = true;
        user.EmailVerificationToken = null;

        await _users.Update(user);

        return AuthResponseDto.SuccessResponse(activationMessage);
    }

    public async Task<AuthResponseDto> UpdateUserRole(string userId, string role)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return AuthResponseDto.Fail("Usuario no encontrado");

        var normalizedRole = RoleNames.Normalize(role);
        if (normalizedRole == null || normalizedRole == RoleNames.SuperAdmin)
            return AuthResponseDto.Fail("Solo se puede asignar el rol USER o ADMIN.");

        var user = await _users.GetById(userId);
        if (user == null)
            return AuthResponseDto.Fail("Usuario no encontrado");

        var currentRole = RoleNames.Normalize(user.Role) ?? RoleNames.User;
        if (currentRole == RoleNames.SuperAdmin)
            return AuthResponseDto.Fail("No se puede cambiar el rol de un SUPER_ADMIN desde esta ruta.");

        if (currentRole == normalizedRole)
            return AuthResponseDto.SuccessResponse("El usuario ya tiene ese rol.");

        user.Role = normalizedRole;
        await _users.Update(user);

        return AuthResponseDto.SuccessResponse("Rol del usuario actualizado correctamente.");
    }

    public async Task<AuthResponseDto> ForgotPassword(string email)
    {
        var user = await _users.GetByEmail(email.Trim());

        if (user == null)
            return AuthResponseDto.Fail("Usuario no encontrado");

        user.PasswordResetToken = Guid.NewGuid().ToString();
        await _users.Update(user);

        return AuthResponseDto.SuccessResponse(
            "Token de recuperacion generado",
            user.PasswordResetToken
        );
    }

    public async Task<AuthResponseDto> ResetPassword(string token, string newPassword)
    {
        var user = await _users.GetByResetToken(token);

        if (user == null)
            return AuthResponseDto.Fail("Token invalido");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;

        await _users.Update(user);

        return AuthResponseDto.SuccessResponse("Password actualizado");
    }

    private static string NormalizeFrontendUrl(string? value)
    {
        var fallback = "http://127.0.0.1:5174";
        var url = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        return url.TrimEnd('/');
    }

    private static string NormalizeBackendUrl(string? value)
    {
        var fallback = "http://127.0.0.1:5023";
        var url = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        return url.TrimEnd('/');
    }
}
