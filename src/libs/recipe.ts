import {
    CATEGORIES,
    deepMerge,
    expandPath,
    templateCatalog,
    type Placement,
    type TextureDefinition,
} from '@laboralphy/hex-tex-gen';

/** the category of a template, as the library lists them */
export type Category = (typeof CATEGORIES)[number];

/** the categories of the templates covering a whole texture: walls, floors and ceilings */
export const BASE_CATEGORIES: Category[] = ['surface', 'ground'];

/** the categories of the templates laid over a base, in the library's order */
export const DECORATION_CATEGORIES: Category[] = CATEGORIES.filter(
    (c) => !BASE_CATEGORIES.includes(c)
);

/**
 * A texture as the studio edits it: a base layer covering the texture, and decorations
 * over it. Only the parameters the user changed are kept, by dotted path: the template
 * defaults fill in the rest, and a recipe stays small enough to store in a level.
 */
export type Recipe = {
    /** size of the texture, in pixels: 64 × 96 for walls, 64 × 64 for flats */
    size: [number, number];
    /** the seed of the whole texture: rerolling it redraws every layer */
    seed: number;
    /**
     * whether decorations may cross an edge and continue on the opposite side, so that the
     * texture tiles with itself; false keeps them inside, for a texture laid next to others;
     * the library's default (true) when unset
     */
    wrap?: boolean;
    base: Layer;
    decorations: Decoration[];
};

/** a template and the values set in its form */
export type Layer = {
    /** unique within a recipe; decorations anchor to it */
    id: string;
    template: string;
    /** values by dotted path: `stone.palette` */
    values: Record<string, unknown>;
};

/** how a decoration is placed */
export type Decoration = Layer & {
    mode: 'free' | 'anchor';
    /** position and size, in percent of the texture */
    x: number;
    y: number;
    width: number;
    height: number;
    /** anchored mode: the layer and the anchor of that layer */
    target: string;
    anchor: string;
    /** anchored mode: share of the anchor points used, and mirroring on corners */
    ratio: number;
    mirror: boolean;
    opacity: number;
    /** its own seed, to redraw it alone: a glyph, a splash; the texture's seed when unset */
    seed?: number;
    /** whether it may cross an edge; the texture's `wrap` when unset */
    wrap?: boolean;
};

/** size presets of the raycaster-386 engine */
export const SIZE_PRESETS: { label: string; size: [number, number] }[] = [
    { label: 'Wall 64 × 96', size: [64, 96] },
    { label: 'Flat 64 × 64', size: [64, 64] },
    { label: 'Wall 128 × 192', size: [128, 192] },
    { label: 'Flat 128 × 128', size: [128, 128] },
];

/**
 * The parameters of a layer: its values expanded from their paths and merged.
 */
export function layerParams(values: Record<string, unknown>): Record<string, unknown> {
    return Object.entries(values).reduce<Record<string, unknown>>(
        (params, [path, value]) => deepMerge(params, expandPath(path, value)),
        {}
    );
}

/**
 * The texture definition of a recipe, as the library renders it and as it is exported.
 */
export function toDefinition(recipe: Recipe): TextureDefinition {
    const base: Placement = {
        id: recipe.base.id,
        patch: { template: recipe.base.template, ...layerParams(recipe.base.values) },
        width: 100,
        height: 100,
    };
    const decorations = recipe.decorations.map((d): Placement => {
        const patch = { template: d.template, ...layerParams(d.values) };
        const common = {
            id: d.id,
            patch,
            width: d.width,
            height: d.height,
            opacity: d.opacity,
            ...(d.seed === undefined ? {} : { seed: d.seed }),
            ...(d.wrap === undefined ? {} : { wrap: d.wrap }),
        };
        if (d.mode === 'anchor') {
            return {
                ...common,
                anchor: { to: d.target, at: d.anchor, ratio: d.ratio, mirror: d.mirror },
            };
        }
        return { ...common, x: d.x, y: d.y };
    });
    return {
        size: recipe.size,
        seed: recipe.seed,
        ...(recipe.wrap === undefined ? {} : { wrap: recipe.wrap }),
        patches: [base, ...decorations],
    };
}

/**
 * The layers a decoration can anchor to: the base and the freely placed decorations
 * before it, which report anchors; an anchored placement cannot be a target itself.
 */
export function anchorTargets(recipe: Recipe, index: number): Layer[] {
    const catalog = templateCatalog();
    const hasAnchors = (layer: Layer) =>
        Object.keys(catalog.find((t) => t.name === layer.template)?.anchors ?? {}).length > 0;
    return [
        recipe.base,
        ...recipe.decorations.slice(0, index).filter((d) => d.mode === 'free'),
    ].filter(hasAnchors);
}

/**
 * Whether a parameter of a layer is left out of its form: a group named after another
 * decoration template (the `moss` of the walls and of `stoneslab`) duplicates that
 * decoration, which is the one way to add it.
 */
export function coveredByDecoration(path: string, template: string): boolean {
    const group = path.split('.')[0];
    return (
        group !== template &&
        templateCatalog().some(
            (t) => t.name === group && DECORATION_CATEGORIES.includes(t.category)
        )
    );
}

let nextId = 1;

/**
 * A new decoration of a template, centered, at the size of its template relative to the
 * texture.
 */
export function newDecoration(template: string, textureSize: [number, number]): Decoration {
    const info = templateCatalog().find((t) => t.name === template);
    const [w, h] = info?.size ?? [32, 32];
    const width = Math.min(100, Math.round((w / textureSize[0]) * 100));
    const height = Math.min(100, Math.round((h / textureSize[1]) * 100));
    return {
        id: `layer-${nextId++}`,
        template,
        values: {},
        mode: 'free',
        x: Math.round((100 - width) / 2),
        y: Math.round((100 - height) / 2),
        width,
        height,
        target: 'base',
        anchor: '',
        ratio: 1,
        mirror: false,
        opacity: 1,
    };
}
