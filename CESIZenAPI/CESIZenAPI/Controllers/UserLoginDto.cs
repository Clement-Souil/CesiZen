using System.Text.Json.Serialization;

namespace CESIZenAPI.Controllers
{
    public class UserLoginDto
    {
        [JsonPropertyName("email")] // Fait le pont avec le "email" de React
        public required string Email { get; set; }
        [JsonPropertyName("password")] // Fait le pont avec le "email" de React
        public required string Password { get; set; }
    }
}