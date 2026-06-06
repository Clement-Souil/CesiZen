using CESIZenAPI.Models;
using Xunit;

namespace CESIZenAPI.Tests
{
    public class StressEventTests
    {
        // ── Default values ────────────────────────────────────────────────

        [Fact]
        public void StressEvent_DefaultEvent_ShouldBeEmptyString()
        {
            var stressEvent = new StressEvent();

            Assert.Equal(string.Empty, stressEvent.Event);
        }

        [Fact]
        public void StressEvent_DefaultValue_ShouldBeZero()
        {
            var stressEvent = new StressEvent();

            Assert.Equal(0, stressEvent.Value);
        }

        // ── Nominal cases ─────────────────────────────────────────────────

        [Fact]
        public void StressEvent_ValidEvent_ShouldBeStored()
        {
            var stressEvent = new StressEvent { Event = "Décès du conjoint", Value = 100 };

            Assert.Equal("Décès du conjoint", stressEvent.Event);
            Assert.Equal(100, stressEvent.Value);
        }

        [Fact]
        public void StressEvent_MaxHolmesRaheValue_ShouldBeStored()
        {
            // Highest value in Holmes & Rahe scale is 100 (death of spouse)
            var stressEvent = new StressEvent { Event = "Décès du conjoint", Value = 100 };

            Assert.Equal(100, stressEvent.Value);
        }

        [Fact]
        public void StressEvent_MinHolmesRaheValue_ShouldBeStored()
        {
            // Lowest value in Holmes & Rahe scale is 11 (minor law violation)
            var stressEvent = new StressEvent { Event = "Infraction mineure à la loi", Value = 11 };

            Assert.Equal(11, stressEvent.Value);
        }

        // ── Edge cases ────────────────────────────────────────────────────

        [Fact]
        public void StressEvent_ValueZero_ShouldBeStored()
        {
            var stressEvent = new StressEvent { Value = 0 };

            Assert.Equal(0, stressEvent.Value);
        }

        [Fact]
        public void StressEvent_NegativeValue_ShouldBeStored()
        {
            // Negative value is invalid business-wise but model should not crash
            var stressEvent = new StressEvent { Value = -10 };

            Assert.Equal(-10, stressEvent.Value);
        }

        [Fact]
        public void StressEvent_EmptyEventString_ShouldBeStored()
        {
            var stressEvent = new StressEvent { Event = string.Empty };

            Assert.Equal(string.Empty, stressEvent.Event);
        }

        [Fact]
        public void StressEvent_LongEventString_ShouldBeStored()
        {
            var longEvent = new string('a', 500);
            var stressEvent = new StressEvent { Event = longEvent };

            Assert.Equal(500, stressEvent.Event.Length);
        }

        // ── Identity ──────────────────────────────────────────────────────

        [Fact]
        public void StressEvent_DefaultId_ShouldBeZero()
        {
            var stressEvent = new StressEvent();

            Assert.Equal(0, stressEvent.Id);
        }

        [Fact]
        public void StressEvent_SetId_ShouldBeStored()
        {
            var stressEvent = new StressEvent { Id = 42 };

            Assert.Equal(42, stressEvent.Id);
        }
    }
}
