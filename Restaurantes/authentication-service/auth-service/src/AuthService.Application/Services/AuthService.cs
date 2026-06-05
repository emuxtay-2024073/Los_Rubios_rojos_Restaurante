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
        var safeUsername = EscapeHtml(user.Username);
        var safeVerificationUrl = EscapeHtml(verificationUrl);
        var emailBody = $@"
        <div style='margin:0;padding:0;background:#120b09;'>
          <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#120b09;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;'>
            <tr>
              <td align='center'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:700px;background:#fffaf0;border-radius:20px;overflow:hidden;border:1px solid #f2c36b;box-shadow:0 22px 70px rgba(0,0,0,.28);'>
                  <tr>
                    <td style='background:#a91010;padding:0;color:#fff8ec;'>
                      <table role='presentation' width='100%' cellspacing='0' cellpadding='0'>
                        <tr>
                          <td style='padding:30px 30px 26px;'>
                            <div style='font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:800;color:#ffd87a;'>Los Rubios Rojos</div>
                            <h1 style='margin:12px 0 0;font-size:36px;line-height:1.05;font-weight:900;'>Tu pase a la cocina digital</h1>
                            <p style='margin:14px 0 0;font-size:16px;line-height:1.65;color:#ffe8bd;'>Confirma tu correo para activar reservas, pedidos y herramientas segun tu rol.</p>
                          </td>
                          <td width='132' align='center' style='padding:20px 24px 20px 0;'>
                            <div style='width:104px;height:104px;border-radius:50%;background:#ffd87a;color:#7d1212;border:7px solid #fff2c8;text-align:center;font-weight:900;line-height:1;'>
                              <div style='font-size:32px;padding-top:22px;'>RR</div>
                              <div style='font-size:10px;letter-spacing:2px;margin-top:7px;'>TICKET</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:0 28px;'>
                      <div style='height:18px;background:repeating-linear-gradient(90deg,#f7b731 0,#f7b731 16px,#fff8ec 16px,#fff8ec 30px,#cf2f2a 30px,#cf2f2a 36px);border-radius:0 0 16px 16px;'></div>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:30px 28px 10px;color:#291817;'>
                      <p style='margin:0 0 18px;font-size:18px;line-height:1.65;'>Hola <strong>{safeUsername}</strong>,</p>
                      <p style='margin:0 0 22px;font-size:16px;line-height:1.7;color:#4b2a25;'>Tu cuenta ya esta creada. Solo falta sellar este ticket para activar tu acceso.</p>
                      <div style='background:#fff;border:2px dashed #d0362d;border-radius:16px;padding:20px;'>
                        <div style='font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9d2a22;font-weight:800;'>Ticket de verificacion</div>
                        <div style='margin-top:8px;font-size:15px;color:#51312c;'>Usalo para confirmar tu correo</div>
                        <div style='margin-top:14px;height:1px;background:repeating-linear-gradient(90deg,#e7b163 0,#e7b163 10px,transparent 10px,transparent 18px);'></div>
                        <div style='margin-top:18px;text-align:center;'>
                          <a href='{safeVerificationUrl}' style='display:inline-block;background:#17386c;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 30px;border-radius:999px;border:3px solid #0f264a;'>Verificar mi correo</a>
                        </div>
                      </div>
                      <p style='margin:22px 0 8px;font-size:14px;color:#6a4943;'>Si el boton no abre, copia este enlace:</p>
                      <p style='margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#17386c;'>{safeVerificationUrl}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:24px 28px 30px;'>
                      <div style='background:#2a1714;color:#ffe7b4;border-radius:14px;padding:16px 18px;font-size:13px;line-height:1.55;border-left:5px solid #f7b731;'>
                        Si no solicitaste esta cuenta, puedes ignorar este correo. Nadie podra entrar sin verificar el enlace.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>";

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

    private static string EscapeHtml(string value)
    {
        return value
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&#039;");
    }
}
