import type { ParameterInfo } from '@laboralphy/hex-tex-gen';

/**
 * The options a parameter is limited to, as its description states them: "grid only: ...",
 * "wood only: ...", "heap or grid only, ...".
 */
function onlyOptions(info: ParameterInfo): string[] | undefined {
    const match = /^([\w-]+(?: or [\w-]+)*) only[:,]/.exec(info.description ?? '');
    return match?.[1].split(' or ');
}

/**
 * The choice a parameter depends on: the one enum of the template offering every option
 * its description is limited to; none when it applies whatever the choices.
 */
export function dependsOn(
    info: ParameterInfo,
    parameters: ParameterInfo[]
): { path: string; options: string[] } | undefined {
    const options = onlyOptions(info);
    if (!options) {
        return undefined;
    }
    const enums = parameters.filter(
        (p) => p.kind === 'enum' && options.every((o) => p.options?.includes(o))
    );
    return enums.length === 1 ? { path: enums[0].path, options } : undefined;
}

/**
 * Whether a parameter has an effect with the choices made: "grid only" parameters of a
 * glyph are left out of its form while it is a pentagram.
 * @param values the values set, by path; unset ones are at their default
 */
export function isRelevant(
    info: ParameterInfo,
    parameters: ParameterInfo[],
    values: Record<string, unknown>
): boolean {
    const dependency = dependsOn(info, parameters);
    if (!dependency) {
        return true;
    }
    const choice = parameters.find((p) => p.path === dependency.path);
    const current = values[dependency.path] ?? choice?.default;
    return dependency.options.includes(current as string);
}

/**
 * The bounds of the slider of a number: its own bounds when both are finite, a full turn
 * for an angle "in degrees" left unbounded; none otherwise.
 */
export function sliderBounds(info: ParameterInfo): [number, number] | undefined {
    if (info.kind !== 'number' && info.kind !== 'integer') {
        return undefined;
    }
    const { minimum, maximum } = info;
    if (
        minimum !== undefined &&
        maximum !== undefined &&
        Number.isFinite(minimum) &&
        Number.isFinite(maximum)
    ) {
        return [minimum, maximum];
    }
    if (/\bin degrees\b/.test(info.description ?? '')) {
        return [minimum ?? 0, maximum ?? (minimum ?? 0) + 360];
    }
    return undefined;
}
