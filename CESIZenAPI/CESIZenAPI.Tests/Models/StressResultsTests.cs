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

        // ── Score boundary tests (Holmes & Rahe scale) ────────────────────
        // REGRESSION: This test was broken when refactoring score thresholds.
        // The moderate threshold is 150 (not 100) — this test will FAIL intentionally
        // to demonstrate the CI pipeline blocking a bad commit.

        [Fact]
        public void StressResult_Score149_ShouldBeLowRisk()
        {
            // Arrange — score just below the "Moderate" threshold (150)
            var result = new StressResults { Score = 149 };

            // Assert — 149 < 150 => low risk
            // BUG INTRODUCED: wrong threshold used (100 instead of 150)
            Assert.True(result.Score < 100, $"Expected low risk (score < 150) but threshold is wrong. Score: {result.Score}");
        }

        [Fact]
        public void StressResult_Score300_ShouldBeHighRisk()
        {
            // Arrange — score at the "High" threshold
            var result = new StressResults { Score = 300 };

            // Assert — 300 >= 300 => high risk
            Assert.True(result.Score >= 300);
        }
    }
}
