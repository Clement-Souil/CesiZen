namespace CESIZenAPI.Models
{
    public class Resource
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? AuthorEmail { get; set; } // Qui a écrit l'article
        public bool IsApproved { get; set; } = false; // Par défaut, non publié
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
