import { describe, it, expect } from 'vitest';
import { getInterpretation } from '../StressTestPage';

describe('Logique du Test de Stress', () => {

    it('doit retourner un niveau Faible pour un score de 100', () => {
        const result = getInterpretation(100);
        expect(result.level).toBe("Faible");
        expect(result.color).toContain("green");
    });

    it('doit retourner un niveau Modéré pour un score de 250', () => {
        const result = getInterpretation(250);
        expect(result.level).toBe("Modéré");
    });

    it('doit retourner un niveau Élevé pour un score de 400', () => {
        const result = getInterpretation(400);
        expect(result.level).toBe("Élevé");
    });

    // ── Tests de bornes (seuils 150 / 300) ──────────────────────────────

    it('doit retourner Faible pour un score de 149 (juste sous le seuil)', () => {
        const result = getInterpretation(149);
        expect(result.level).toBe("Faible");
    });

    it('doit retourner Modéré pour un score de 150 (borne incluse)', () => {
        const result = getInterpretation(150);
        expect(result.level).toBe("Modéré");
    });

    it('doit retourner Modéré pour un score de 299 (juste sous le seuil)', () => {
        const result = getInterpretation(299);
        expect(result.level).toBe("Modéré");
    });

    it('doit retourner Élevé pour un score de 300 (borne incluse)', () => {
        const result = getInterpretation(300);
        expect(result.level).toBe("Élevé");
    });

    it('doit retourner Faible pour un score de 0', () => {
        const result = getInterpretation(0);
        expect(result.level).toBe("Faible");
    });
});