using CESIZenAPI.Models;
using Xunit;

namespace CESIZenAPI.Tests
{
    public class StressResultsTests
    {
        [Fact]
        public void StressResult_ShouldSetDefaultDate()
        {
            // Arrange & Act
            var result = new StressResults();

            // Assert
            Assert.True(result.CreatedAt <= DateTime.Now);
            Assert.NotNull(result.CreatedAt);
        }

        [Fact]
        public void StressResult_ShouldHandleNullUserEmail()
        {
            // Act
            var result = new StressResults { UserEmail = null };

            // Assert
            Assert.Null(result.UserEmail);
        }
    }
}