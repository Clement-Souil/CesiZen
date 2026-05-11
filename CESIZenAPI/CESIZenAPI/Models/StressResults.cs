using System;

namespace CESIZenAPI.Models
{
    public class StressResults
    {
        public int Id { get; set; }
        public string? UserEmail { get; set; }
        public int Score { get; set; }
        public string? Level { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}