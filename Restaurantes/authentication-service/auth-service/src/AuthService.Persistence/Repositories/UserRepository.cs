using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByUsername(string username)
    {
        var normalizedUsername = username.Trim().ToLower();
        return _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);
    }

    public Task<User?> GetById(string id) =>
        _context.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByEmail(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        return _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    public Task<User?> GetByVerificationToken(string token) =>
        _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

    public Task<User?> GetByAdminActivationToken(string token) =>
        _context.Users.FirstOrDefaultAsync(u => u.AdminActivationToken == token);

    public Task<User?> GetByResetToken(string token) =>
        _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token);

    public async Task<IReadOnlyList<User>> GetAll() =>
        await _context.Users
            .OrderBy(u => u.Username)
            .ToListAsync();

    public async Task Add(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task Update(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}
