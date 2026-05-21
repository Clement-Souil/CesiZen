using CESIZenAPI.Models;
using Xunit;

namespace CESIZenAPI.Tests
{
    public class UserTests
    {
        // ── Default values ────────────────────────────────────────────────

        [Fact]
        public void User_DefaultRole_ShouldBeUser()
        {
            var user = new User();

            Assert.Equal("USER", user.role);
        }

        [Fact]
        public void User_DefaultIsActive_ShouldBeTrue()
        {
            var user = new User();

            Assert.True(user.IsActive);
        }

        [Fact]
        public void User_DefaultId_ShouldBeNewGuid()
        {
            var user = new User();

            Assert.NotEqual(Guid.Empty, user.Id);
        }

        [Fact]
        public void User_DefaultEmail_ShouldBeEmptyString()
        {
            var user = new User();

            Assert.Equal(string.Empty, user.Email);
        }

        [Fact]
        public void User_DefaultPasswordHash_ShouldBeEmptyString()
        {
            var user = new User();

            Assert.Equal(string.Empty, user.PasswordHash);
        }

        [Fact]
        public void User_DefaultDisplayName_ShouldBeNull()
        {
            var user = new User();

            Assert.Null(user.DisplayName);
        }

        [Fact]
        public void User_CreateAt_ShouldBeRecent()
        {
            var before = DateTime.UtcNow.AddSeconds(-1);
            var user = new User();
            var after = DateTime.UtcNow.AddSeconds(1);

            Assert.InRange(user.CreateAt, before, after);
        }

        // ── Nominal cases ─────────────────────────────────────────────────

        [Fact]
        public void User_ValidUser_ShouldStoreAllFields()
        {
            var user = new User
            {
                Email = "clement@cesi.fr",
                PasswordHash = "hashed_password",
                DisplayName = "Clément",
                role = "USER",
                IsActive = true
            };

            Assert.Equal("clement@cesi.fr", user.Email);
            Assert.Equal("hashed_password", user.PasswordHash);
            Assert.Equal("Clément", user.DisplayName);
            Assert.Equal("USER", user.role);
            Assert.True(user.IsActive);
        }

        [Fact]
        public void User_AdminRole_ShouldBeStored()
        {
            var user = new User { role = "ADMIN" };

            Assert.Equal("ADMIN", user.role);
        }

        // ── Edge cases ────────────────────────────────────────────────────

        [Fact]
        public void User_DisabledUser_IsActiveShouldBeFalse()
        {
            var user = new User { IsActive = false };

            Assert.False(user.IsActive);
        }

        [Fact]
        public void User_TwoUsers_ShouldHaveDifferentIds()
        {
            var user1 = new User();
            var user2 = new User();

            Assert.NotEqual(user1.Id, user2.Id);
        }

        [Fact]
        public void User_EmptyEmail_ShouldBeStored()
        {
            var user = new User { Email = string.Empty };

            Assert.Equal(string.Empty, user.Email);
        }

        [Fact]
        public void User_EmptyPasswordHash_ShouldBeStored()
        {
            // Validation is handled at the API layer, not the model
            var user = new User { PasswordHash = string.Empty };

            Assert.Equal(string.Empty, user.PasswordHash);
        }

        [Fact]
        public void User_UnknownRole_ShouldBeStored()
        {
            // Role validation is handled at the API layer
            var user = new User { role = "SUPERADMIN" };

            Assert.Equal("SUPERADMIN", user.role);
        }
    }
}
