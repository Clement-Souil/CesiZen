using System.ComponentModel.DataAnnotations;

namespace CESIZenAPI.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string?DisplayName { get; set; }

        [Required]
        public string role { get; set; } = "USER"; 

        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdateAt { get; set; } = DateTime.UtcNow;
    }
}
