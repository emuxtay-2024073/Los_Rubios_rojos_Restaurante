using AuthService.Application.Utilities;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AuthService.Api.Infrastructure;

public static class DefaultAdminSeeder
{
    private const string DefaultUsername = "adminrestaurante";
    private const string DefaultEmail = "adminrestaurante@losrezagados.com";
    public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var users = serviceProvider.GetRequiredService<IUserRepository>();

        var username = NormalizeValue(configuration["SeedAdmin:Username"], DefaultUsername);
        var email = NormalizeValue(configuration["SeedAdmin:Email"], DefaultEmail);
        var password = configuration["SeedAdmin:Password"]?.Trim();
        var role = RoleNames.Normalize(configuration["SeedAdmin:Role"]) ?? RoleNames.SuperAdmin;

        if (string.IsNullOrWhiteSpace(password))
        {
            Console.WriteLine("[Seed] SeedAdmin:Password no definido. No se creara ni actualizara el admin predeterminado.");
            return;
        }

        var existingUser = await users.GetByUsername(username) ?? await users.GetByEmail(email);
        if (existingUser != null)
        {
            existingUser.Username = username;
            existingUser.Email = email;
            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            existingUser.Role = role;
            existingUser.EmailConfirmed = true;
            existingUser.EmailVerificationToken = null;
            existingUser.PasswordResetToken = null;

            await users.Update(existingUser);
            Console.WriteLine($"[Seed] Admin predeterminado actualizado: {email}");
            return;
        }

        var admin = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            EmailConfirmed = true,
            EmailVerificationToken = null,
            PasswordResetToken = null
        };

        await users.Add(admin);

        Console.WriteLine($"[Seed] Admin predeterminado creado: {email}");
    }

    private static string NormalizeValue(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }
}
