using CESIZenAPI.Data;
using CESIZenAPI.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.DependencyInjection;



namespace CESIZenAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

           

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

            // Configuration de l'authentification JWT
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            builder.Services.AddAuthentication(options =>
            {
                // Authentitification + autorhoriasation
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // CONFIGURATION de la validation du token 
                    ValidateIssuerSigningKey = true, 
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    ClockSkew = TimeSpan.Zero // Pour que le token expire pile � l'heure
                };
            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "Colle ton token ici : Bearer {ton_token}",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        new string[] { }
                    }
                });
            });

            builder.Services.AddCors(options =>
            {
                //options.AddPolicy("AllowReactApp",
                options.AddPolicy("AllowAll",
                    policy =>
                    {
                        //policy.WithOrigins("http://localhost:5173")
                        policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader();

                    });
            });
            
            // Le builder je dois le mettre en dernier parce que ca v�rouille sinon
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                //Pour avoir swagger
                app.UseSwaggerUI(options => options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1"));
            }

            app.UseRouting();
            //app.UseHttpsRedirection();


            //app.UseCors("AllowReactApp"); // Applique la politique CORS, inchallah ca marche 
            app.UseCors("AllowAll");
            app.UseAuthentication(); //Pour savoir qui est l'utilisateur

            app.UseAuthorization();// Pour savoir qu'il a le droit de se connecter 


            app.MapControllers();

            // Apply migrations and seed data on startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.Migrate();
                if (!db.StressEvents.Any())
                {
                    db.StressEvents.AddRange(new List<StressEvent>
                    {
                        new() { Event = "Décès d'un conjoint", Value = 100 },
                        new() { Event = "Divorce", Value = 73 },
                        new() { Event = "Séparation conjugale", Value = 65 },
                        new() { Event = "Emprisonnement", Value = 63 },
                        new() { Event = "Décès d'un membre proche de la famille", Value = 63 },
                        new() { Event = "Maladie ou blessure personnelle", Value = 53 },
                        new() { Event = "Mariage", Value = 50 },
                        new() { Event = "Licenciement", Value = 47 },
                        new() { Event = "Réconciliation conjugale", Value = 45 },
                        new() { Event = "Retraite", Value = 45 },
                        new() { Event = "Changement dans la santé d'un membre de la famille", Value = 44 },
                        new() { Event = "Grossesse", Value = 40 },
                        new() { Event = "Difficultés sexuelles", Value = 39 },
                        new() { Event = "Arrivée d'un nouveau membre dans la famille", Value = 39 },
                        new() { Event = "Changement important au travail", Value = 39 },
                        new() { Event = "Changement de situation financière", Value = 38 },
                        new() { Event = "Décès d'un ami proche", Value = 37 },
                        new() { Event = "Changement de type de travail", Value = 36 },
                        new() { Event = "Changement dans le nombre de disputes conjugales", Value = 35 },
                        new() { Event = "Emprunt important", Value = 31 },
                        new() { Event = "Saisie d'un prêt ou d'une hypothèque", Value = 30 },
                        new() { Event = "Changement de responsabilités au travail", Value = 29 },
                        new() { Event = "Départ d'un enfant de la maison", Value = 29 },
                        new() { Event = "Problèmes avec la belle-famille", Value = 29 },
                        new() { Event = "Réussite personnelle remarquable", Value = 28 },
                        new() { Event = "Début ou arrêt de travail du conjoint", Value = 26 },
                        new() { Event = "Début ou fin des études", Value = 26 },
                        new() { Event = "Changement dans les conditions de vie", Value = 25 },
                        new() { Event = "Révision des habitudes personnelles", Value = 24 },
                        new() { Event = "Problèmes avec le patron", Value = 23 },
                        new() { Event = "Changement d'horaires ou de conditions de travail", Value = 20 },
                        new() { Event = "Changement de résidence", Value = 20 },
                        new() { Event = "Changement d'école", Value = 20 },
                        new() { Event = "Changement de loisirs", Value = 19 },
                        new() { Event = "Changement d'activités religieuses", Value = 19 },
                        new() { Event = "Changement d'activités sociales", Value = 18 },
                        new() { Event = "Emprunt modéré", Value = 17 },
                        new() { Event = "Changement dans les habitudes de sommeil", Value = 16 },
                        new() { Event = "Changement du nombre de réunions familiales", Value = 15 },
                        new() { Event = "Changement dans les habitudes alimentaires", Value = 15 },
                        new() { Event = "Vacances", Value = 13 },
                        new() { Event = "Fêtes de fin d'année", Value = 12 },
                        new() { Event = "Infractions mineures à la loi", Value = 11 },
                    });
                    db.SaveChanges();
                }
            }

            app.Run();
        }
    }
}
