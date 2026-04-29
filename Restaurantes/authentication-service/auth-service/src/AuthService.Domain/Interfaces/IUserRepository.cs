using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByUsername(string username);
    Task<User?> GetByEmail(string email);
    Task<User?> GetByVerificationToken(string token);
    Task<User?> GetByResetToken(string token);

    Task Add(User user);
    Task Update(User user);
}