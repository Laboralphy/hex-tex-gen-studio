import { describe, expect, it } from 'vitest';
import { toHexColor } from '../src/libs/colors';

describe('toHexColor', () => {
    it('gives the #rrggbb form color inputs need', () => {
        expect(toHexColor('#A1B2C3')).toBe('#a1b2c3');
        expect(toHexColor('#abc')).toBe('#aabbcc');
        expect(toHexColor('#abcd')).toBe('#aabbcc');
        expect(toHexColor('#11223344')).toBe('#112233');
        expect(toHexColor('red')).toBe('#808080');
        expect(toHexColor(undefined)).toBe('#808080');
    });
});
