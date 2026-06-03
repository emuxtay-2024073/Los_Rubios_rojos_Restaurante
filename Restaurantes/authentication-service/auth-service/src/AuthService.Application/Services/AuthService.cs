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
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository users, IJwtService jwt, IEmailService email, IConfiguration configuration)
    {
        _users = users;
        _jwt = jwt;
        _email = email;
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
                    ? $"{NormalizeFrontendUrl(_configuration["AppSettings:FrontendUrl"])}/verify-email?token={user.EmailVerificationToken}"
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
        var email = dto.Email.Trim();

        if (await _users.GetByUsername(username) != null)
            return AuthResponseDto.Fail("El usuario ya existe");

        if (await _users.GetByEmail(email) != null)
            return AuthResponseDto.Fail("El email ya esta registrado");

        var role = RoleNames.Normalize(string.IsNullOrWhiteSpace(dto.Role) ? RoleNames.Cliente : dto.Role);

        if (role == null)
            return AuthResponseDto.Fail("El rol solo puede ser cliente o admin");

        if (role == RoleNames.Admin && !RoleNames.IsValidAdminSecret(dto.SecretKey))
            return AuthResponseDto.Fail("Se necesita la clave secreta para ser admin");

        var verificationToken = Guid.NewGuid().ToString();

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            EmailConfirmed = false,
            EmailVerificationToken = verificationToken
        };

        await _users.Add(user);

        var frontendUrl = NormalizeFrontendUrl(_configuration["AppSettings:FrontendUrl"]);
        var verificationUrl = $"{frontendUrl}/verify-email?token={verificationToken}";
        var emailBody = $@"
        <div style='font-family:Arial,sans-serif;background:#fff3db;padding:32px;color:#3c1518;'>
          <div style='max-width:560px;margin:0 auto;background:#fff9ee;border:1px solid #f0d4aa;border-radius:18px;padding:28px;text-align:center;'>
            <h2 style='margin:0 0 12px;font-size:26px;'>Confirma tu correo</h2>
            <p style='margin:0 0 18px;line-height:1.6;'>Hola {user.Username}, tu cuenta fue creada correctamente.</p>
            <p style='margin:0 0 24px;line-height:1.6;'>Para poder iniciar sesion, primero verifica tu email con este boton:</p>
            <a href='{verificationUrl}' style='display:inline-block;background:#D83030;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:999px;padding:13px 24px;'>Verificar email</a>
            <p style='margin:24px 0 0;font-size:13px;color:#7E6551;line-height:1.5;'>Si el boton no funciona, copia y pega este enlace en tu navegador:<br>{verificationUrl}</p>
          </div>
        </div>
        ";

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

        user.EmailConfirmed = true;
        user.EmailVerificationToken = null;

        await _users.Update(user);

        return AuthResponseDto.SuccessResponse("Email verificado correctamente");
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
}
