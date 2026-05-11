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
});