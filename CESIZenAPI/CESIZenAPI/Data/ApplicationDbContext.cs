using CESIZenAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CESIZenAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }

        //Ici, je déclare mes tables 
        //Chaque DbSet correspond à une table dans la base de données.
        public DbSet<User> Users { get; set; }
        public DbSet<StressResults> StressResults { get; set; }

        public DbSet<Resource> Resources { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Ici, je peux ajouter des contraintes spécifiques comme
            //l'unicité de l'email 
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            //Relation entre utilisateur et resultats de test stress
            modelBuilder.Entity<StressResults>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.UserEmail)
                .HasPrincipalKey(u => u.Email);
        }

    }
}
