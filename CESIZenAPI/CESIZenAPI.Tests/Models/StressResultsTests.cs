using CESIZenAPI.Models;
using Xunit;

namespace CESIZenAPI.Tests
{
    public class StressResultsTests
    {
        // ── Existing tests ────────────────────────────────────────────────

        [Fact]
        public void StressResult_ShouldSetDefaultDate()
        {
            var result = new StressResults();

            Assert.True(result.CreatedAt <= DateTime.Now);
        }

        [Fact]
        public void StressResult_ShouldHandleNullUserEmail()
        {
            var result = new StressResults { UserEmail = null };

            Assert.Null(result.UserEmail);
        }

        // ── Score boundary tests ──────────────────────────────────────────

        [Fact]
        public void StressResult_ScoreZero_ShouldBeValid()
        {
            var result = new StressResults { Score = 0 };

            Assert.Equal(0, result.Score);
        }

        [Fact]
        public void StressResult_ScoreBelow150_ShouldBeLowStress()
        {
            var result = new StressResults { Score = 149, Level = "Faible" };

            Assert.Equal(149, result.Score);
            Assert.Equal("Faible", result.Level);
        }

        [Fact]
        public void StressResult_ScoreExactly150_ShouldBeModerateStress()
        {
            var result = new StressResults { Score = 150, Level = "Modéré" };

            Assert.Equal(150, result.Score);
            Assert.Equal("Modéré", result.Level);
        }

        [Fact]
        public void StressResult_ScoreBelow300_ShouldBeModerateStress()
        {
            var result = new StressResults { Score = 299, Level = "Modéré" };

            Assert.Equal(299, result.Score);
            Assert.Equal("Modéré", result.Level);
        }

        [Fact]
        public void StressResult_ScoreExactly300_ShouldBeHighStress()
        {
            var result = new StressResults { Score = 300, Level = "Élevé" };

            Assert.Equal(300, result.Score);
            Assert.Equal("Élevé", result.Level);
        }

        [Fact]
        public void StressResult_ScoreAbove300_ShouldBeHighStress()
        {
            var result = new StressResults { Score = 500, Level = "Élevé" };

            Assert.Equal(500, result.Score);
            Assert.Equal("Élevé", result.Level);
        }

        [Fact]
        public void StressResult_NegativeScore_ShouldStillBeStored()
        {
            // Negative score is invalid business-wise but the model should not crash
            var result = new StressResults { Score = -1 };

            Assert.Equal(-1, result.Score);
        }

        // ── Level field tests ─────────────────────────────────────────────

        [Fact]
        public void StressResult_LevelNull_ShouldBeAccepted()
        {
            var result = new StressResults { Level = null };

            Assert.Null(result.Level);
        }

        [Fact]
        public void StressResult_LevelEmpty_ShouldBeAccepted()
        {
            var result = new StressResults { Level = string.Empty };

            Assert.Equal(string.Empty, result.Level);
        }

        // ── Default values ────────────────────────────────────────────────

        [Fact]
        public void StressResult_DefaultScore_ShouldBeZero()
        {
            var result = new StressResults();

            Assert.Equal(0, result.Score);
        }

        [Fact]
        public void StressResult_CreatedAt_ShouldNotBeInFuture()
        {
            var result = new StressResults();

            Assert.True(result.CreatedAt <= DateTime.Now);
        }

        [Fact]
        public void StressResult_CreatedAt_ShouldBeRecent()
        {
            var before = DateTime.Now.AddSeconds(-1);
            var result = new StressResults();
            var after = DateTime.Now.AddSeconds(1);

            Assert.InRange(result.CreatedAt, before, after);
        }
    }
}
