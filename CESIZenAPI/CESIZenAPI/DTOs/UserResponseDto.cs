namespace CESIZenAPI.DTOs
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string Role { get; set; } = "USER";
        public bool IsActive { get; set; } = true;
    }
}
