using CESIZenAPI.Data;
using CESIZenAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CESIZenAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StressEventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StressEventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/StressEvents - Public
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<StressEvent>>> GetAll()
        {
            return Ok(await _context.StressEvents.OrderBy(e => e.Id).ToListAsync());
        }

        // POST api/StressEvents - Admin seulement
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<StressEvent>> Create([FromBody] StressEvent dto)
        {
            var stressEvent = new StressEvent
            {
                Event = dto.Event,
                Value = dto.Value
            };
            _context.StressEvents.Add(stressEvent);
            await _context.SaveChangesAsync();
            return Ok(stressEvent);
        }

        // PUT api/StressEvents/{id} - Admin seulement
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult> Update(int id, [FromBody] StressEvent dto)
        {
            var stressEvent = await _context.StressEvents.FindAsync(id);
            if (stressEvent == null) return NotFound();

            stressEvent.Event = dto.Event;
            stressEvent.Value = dto.Value;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/StressEvents/{id} - Admin seulement
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult> Delete(int id)
        {
            var stressEvent = await _context.StressEvents.FindAsync(id);
            if (stressEvent == null) return NotFound();

            _context.StressEvents.Remove(stressEvent);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
