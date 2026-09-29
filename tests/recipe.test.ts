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

    it('gives a decoration its own seed, when set', () => {
        const r = recipe();
        r.decorations.push(newDecoration('glyph', r.size), {
            ...newDecoration('glyph', r.size),
            seed: 42,
        });
        const [, texture, own] = toDefinition(r).patches;
        expect(texture).not.toHaveProperty('seed');
        expect(own).toMatchObject({ seed: 42 });
    });

    it('passes the wrapping of the texture and of each decoration, when set', () => {
        const r = recipe();
        r.decorations.push(newDecoration('opening', r.size), {
            ...newDecoration('opening', r.size),
            wrap: true,
        });
        expect(toDefinition(r)).not.toHaveProperty('wrap');
        r.wrap = false;
        const { wrap, patches } = toDefinition(r);
        expect(wrap).toBe(false);
        expect(patches[1]).not.toHaveProperty('wrap');
        expect(patches[2]).toMatchObject({ wrap: true });
    });

    it('keeps a decoration crossing an edge inside the texture, when it does not wrap', () => {
        const r = recipe();
        const render = () => renderTexture(toDefinition(r), createMemoryLoader({}));
        const leftColumn = (t: ReturnType<typeof render>) =>
            Array.from({ length: t.height }, (_, y) => t.getPixel(0, y));
        const bare = leftColumn(render());
        // an opening past the right edge: it wraps around to the left by default
        r.decorations.push({ ...newDecoration('opening', r.size), x: 90, y: 30 });
        expect(leftColumn(render())).not.toEqual(bare);
        r.decorations[0].wrap = false;
        expect(leftColumn(render())).toEqual(bare);
    });

    it('renders the slab, the beam, the splatter and the glyph as decorations', () => {
        const r = recipe();
        for (const template of ['stoneslab', 'woodbeam', 'splatter', 'glyph']) {
            r.decorations.push(newDecoration(template, r.size));
        }
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
