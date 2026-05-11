using CESIZenAPI.Data;
using Microsoft.AspNetCore.Mvc;
using CESIZenAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class ResourcesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ResourcesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Public : uniquement les ressources approuvées
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Resource>>> GetResources()
    {
        return await _context.Resources
            .Where(r => r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    // Admin : toutes les ressources (approuvées et en attente)
    [HttpGet("admin")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<IEnumerable<Resource>>> GetAllResources()
    {
        return await _context.Resources
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    // Récupérer une ressource par ID
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<Resource>> GetResource(int id)
    {
        var resource = await _context.Resources.FindAsync(id);
        if (resource == null) return NotFound();
        return Ok(resource);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<Resource>> PostResource(Resource resource)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        resource.AuthorEmail = userEmail;
        resource.CreatedAt = DateTime.UtcNow;
        resource.IsApproved = true; // Les admins publient directement

        _context.Resources.Add(resource);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResource), new { id = resource.Id }, resource);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> PutResource(int id, Resource resource)
    {
        if (id != resource.Id) return BadRequest();

        _context.Entry(resource).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteResource(int id)
    {
        var resource = await _context.Resources.FindAsync(id);
        if (resource == null) return NotFound();

        _context.Resources.Remove(resource);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
