using CESIZenAPI.Data;
using CESIZenAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CESIZenAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StressResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StressResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<StressResults>> PostStressResult(StressResults result)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            // On force l'email extrait du Token dans l'objet avant la sauvegarde
            result.UserEmail = userEmail;
            result.CreatedAt = DateTime.Now;

            _context.StressResults.Add(result);
            await _context.SaveChangesAsync();

            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<StressResults>>> GetHistory()
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            return await _context.StressResults
                .Where(r => r.UserEmail == userEmail)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}