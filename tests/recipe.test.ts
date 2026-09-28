import { createMemoryLoader, renderTexture } from '@laboralphy/hex-tex-gen';
import { describe, expect, it } from 'vitest';
import {
    anchorTargets,
    coveredByDecoration,
    DECORATION_CATEGORIES,
    layerParams,
    newDecoration,
    toDefinition,
    type Recipe,
} from '../src/libs/recipe';

function recipe(): Recipe {
    return {
        size: [64, 96],
        seed: 7,
        base: {
            id: 'base',
            template: 'ashlar',
            values: { age: 0.8, 'stone.palette': ['#000', '#fff'] },
        },
        decorations: [],
    };
}

describe('recipe', () => {
    it('expands the values of a layer into parameters', () => {
        expect(layerParams({ age: 0.5, 'mortar.size': 3, 'mortar.color': '#111' })).toEqual({
            age: 0.5,
            mortar: { size: 3, color: '#111' },
        });
    });

    it('becomes a texture definition the library renders', () => {
        const r = recipe();
        const moss = newDecoration('moss', r.size);
        r.decorations.push({
            ...moss,
            mode: 'anchor',
            target: 'base',
            anchor: 'rows',
            width: 100,
            height: 20,
        });
        const definition = toDefinition(r);
        expect(definition.patches[0]).toMatchObject({
            id: 'base',
            patch: { template: 'ashlar', age: 0.8, stone: { palette: ['#000', '#fff'] } },
        });
        expect(definition.patches[1]).toMatchObject({
            patch: { template: 'moss' },
            anchor: { to: 'base', at: 'rows' },
        });
        expect(definition.patches[1]).not.toHaveProperty('x');
        const texture = renderTexture(definition, createMemoryLoader({}));
        expect([texture.width, texture.height]).toEqual([64, 96]);
    });

    it('places a new decoration centered, at its own size', () => {
        const d = newDecoration('shield', [64, 96]);
        // a 24 x 32 shield on a 64 x 96 wall
        expect([d.width, d.height]).toEqual([38, 33]);
        expect([d.x, d.y]).toEqual([31, 34]);
        expect(newDecoration('shield', [64, 96]).id).not.toBe(d.id);
    });

    it('renders the slab and the wooden beam as decorations', () => {
        const r = recipe();
        r.decorations.push(newDecoration('stoneslab', r.size), newDecoration('woodbeam', r.size));
        const texture = renderTexture(toDefinition(r), createMemoryLoader({}));
        expect([texture.width, texture.height]).toEqual([64, 96]);
        expect(DECORATION_CATEGORIES).not.toContain('surface');
        expect(DECORATION_CATEGORIES).toContain('architecture');
    });

    it('leaves out of a base the groups a decoration duplicates', () => {
        expect(coveredByDecoration('moss.palette', 'ashlar')).toBe(true);
        expect(coveredByDecoration('moss.coverage', 'stoneslab')).toBe(true);
        expect(coveredByDecoration('moss.palette', 'moss')).toBe(false);
        expect(coveredByDecoration('stone.palette', 'ashlar')).toBe(false);
        expect(coveredByDecoration('age', 'ashlar')).toBe(false);
    });

    it('anchors decorations to the base and to earlier free layers with anchors', () => {
        const r = recipe();
        const hole = { ...newDecoration('opening', r.size), id: 'hole' };
        const anchored = { ...newDecoration('bars', r.size), mode: 'anchor' as const };
        const web = newDecoration('cobweb', r.size);
        r.decorations.push(hole, anchored, web);
        expect(anchorTargets(r, 0).map((l) => l.id)).toEqual(['base']);
        expect(anchorTargets(r, 2).map((l) => l.id)).toEqual(['base', 'hole']);
    });
});
