import { describeParameters, generators } from '@laboralphy/hex-tex-gen';
import { describe, expect, it } from 'vitest';
import { dependsOn, isRelevant, sliderBounds } from '../src/libs/parameters';

const glyph = describeParameters(generators.glyph);
const splatter = describeParameters(generators.splatter);
const fieldstone = describeParameters(generators.fieldstone);
const param = (list: typeof glyph, path: string) => list.find((p) => p.path === path)!;

describe('parameters', () => {
    it('finds the choice a parameter depends on, from its description', () => {
        expect(dependsOn(param(glyph, 'grid.filled'), glyph)).toEqual({
            path: 'type',
            options: ['grid'],
        });
        expect(dependsOn(param(fieldstone, 'stones.jitter'), fieldstone)).toEqual({
            path: 'stones.layout',
            options: ['grid'],
        });
        expect(dependsOn(param(glyph, 'chaos'), glyph)).toBeUndefined();
    });

    it('hides the parameters of the other choices', () => {
        const filled = param(glyph, 'grid.filled');
        // a pentagram by default
        expect(isRelevant(filled, glyph, {})).toBe(false);
        expect(isRelevant(filled, glyph, { type: 'grid' })).toBe(true);
        expect(isRelevant(param(glyph, 'tally.count'), glyph, { type: 'grid' })).toBe(false);
        expect(isRelevant(param(glyph, 'stroke.color'), glyph, {})).toBe(true);
    });

    it('slides numbers between their bounds, and angles over a full turn', () => {
        expect(sliderBounds(param(splatter, 'direction.bias'))).toEqual([0, 1]);
        expect(sliderBounds(param(splatter, 'direction.angle'))).toEqual([0, 360]);
        expect(sliderBounds(param(splatter, 'impact.radius'))).toBeUndefined();
        expect(sliderBounds(param(splatter, 'liquid.color'))).toBeUndefined();
    });
});
