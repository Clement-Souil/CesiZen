using CESIZenAPI.Data;
using CESIZenAPI.DTOs;
using CESIZenAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace CESIZenAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public UsersController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<User>> Register(UserRegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Cet email est déjà utilisé.");

            var newUser = new User
            {
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                role = "USER",
                IsActive = true,
                CreateAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new UserResponseDto
            {
                Id = newUser.Id,
                Email = newUser.Email,
                DisplayName = newUser.DisplayName,
                Role = newUser.role,
                IsActive = newUser.IsActive
            });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<string>> Login(UserLoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Email ou mot de passe incorrect.");

            if (!user.IsActive)
                return Unauthorized("Ce compte a été désactivé. Contactez un administrateur.");

            var token = CreateToken(user);
            return Ok(new { token = token, user = user.Email, role = user.role });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDto>> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null) return NotFound();

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.role,
                IsActive = user.IsActive
            });
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest("Mot de passe actuel incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    DisplayName = u.DisplayName,
                    Role = u.role,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Utilisateur non trouvé.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}/toggle-active")]
        public async Task<ActionResult> ToggleUserActive(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Utilisateur non trouvé.");

            user.IsActive = !user.IsActive;
            user.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = user.IsActive });
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}/role")]
        public async Task<ActionResult> UpdateRole(Guid id, [FromBody] string newRole)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Utilisateur non trouvé.");

            user.role = newRole.ToUpper();
            user.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("Jwt:Key").Value!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddHours(1),
                SigningCredentials = creds,
                Issuer = _config.GetSection("Jwt:Issuer").Value,
                Audience = _config.GetSection("Jwt:Audience").Value
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
