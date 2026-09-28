import { Rainbow, type Color32 } from '@laboralphy/rainbow';

/** grey, for what cannot be parsed */
const FALLBACK = '#808080';

function parse(color: string | undefined): Color32 | undefined {
    try {
        return Rainbow.parse((color ?? '').trim());
    } catch {
        return undefined;
    }
}

/**
 * A CSS color as `#rrggbb`, the only format `<input type="color">` accepts: any CSS color
 * the library reads (hex, names, `rgb()`, `hsl()`), without its alpha; grey otherwise.
 */
export function toHexColor(color: string | undefined): string {
    const c = parse(color);
    return c === undefined ? FALLBACK : Rainbow.renderHex6(c);
}

/**
 * The colors of a palette between its first and its last, recomputed as an even RGB
 * gradient; the ends are kept.
 */
export function interpolatePalette(colors: string[]): string[] {
    if (colors.length < 3) {
        return colors.map(toHexColor);
    }
    const first = parse(colors[0]) ?? Rainbow.parse(FALLBACK);
    const last = parse(colors[colors.length - 1]) ?? Rainbow.parse(FALLBACK);
    return Rainbow.createPalette([
        [0, first],
        [colors.length - 1, last],
    ]).map((c) => Rainbow.renderHex6(c));
}
