import { describe, expect, it } from 'vitest';
import { interpolatePalette, toHexColor } from '../src/libs/colors';

describe('interpolatePalette', () => {
    it('spreads the colors evenly between the first and the last', () => {
        expect(interpolatePalette(['#000000', '#123456', '#abcdef', '#ffffff'])).toEqual([
            '#000000',
            '#555555',
            '#aaaaaa',
            '#ffffff',
        ]);
        expect(interpolatePalette(['#000', '#f00', '#fff'])).toEqual([
            '#000000',
            '#808080',
            '#ffffff',
        ]);
        expect(interpolatePalette(['#123', '#fff'])).toEqual(['#112233', '#ffffff']);
    });
});

describe('toHexColor', () => {
    it('gives the #rrggbb form color inputs need', () => {
        expect(toHexColor('#A1B2C3')).toBe('#a1b2c3');
        expect(toHexColor('#abc')).toBe('#aabbcc');
        expect(toHexColor('#abcd')).toBe('#aabbcc');
        expect(toHexColor('#11223344')).toBe('#112233');
        expect(toHexColor('red')).toBe('#ff0000');
        expect(toHexColor('rgb(0, 128, 255)')).toBe('#0080ff');
        expect(toHexColor('not a color')).toBe('#808080');
        expect(toHexColor(undefined)).toBe('#808080');
    });
});
