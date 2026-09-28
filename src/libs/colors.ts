/**
 * A CSS color as `#rrggbb`, the only format `<input type="color">` accepts: `#rgb` is
 * expanded, `#rrggbbaa` loses its alpha; other formats (names, `rgb()`) fall back to grey.
 */
export function toHexColor(color: string | undefined): string {
    const c = (color ?? '').trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(c)) {
        return c;
    }
    if (/^#[0-9a-f]{8}$/.test(c)) {
        return c.slice(0, 7);
    }
    if (/^#[0-9a-f]{3,4}$/.test(c)) {
        return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    }
    return '#808080';
}
