using Microsoft.EntityFrameworkCore;
using AuthService.Domain.Entities;

namespace AuthService.Persistence.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id)
                .IsRequired();

            entity.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(u => u.Username).IsUnique();

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasIndex(u => u.Email).IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired();

            entity.Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(u => u.EmailConfirmed)
                .IsRequired();

            // 🔹 Tokens (opcional pero correcto)
            entity.Property(u => u.EmailVerificationToken)
                .HasMaxLength(200);

            entity.Property(u => u.PasswordResetToken)
                .HasMaxLength(200);
        });
    }
}