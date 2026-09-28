import { templateCatalog } from '@laboralphy/hex-tex-gen';
import { reactive } from 'vue';
import { renderer } from '../libs/renderer';

/** side of a thumbnail, in pixels */
const SIZE = 48;

/** thumbnails of every template, rendered once, shared by every gallery */
const thumbnails = reactive<Record<string, ImageData>>({});
let started = false;

/**
 * A thumbnail of every template, with its defaults: overlays over a dark background.
 * They are rendered in the background the first time they are asked for.
 */
export function useThumbnails(): Record<string, ImageData> {
    if (!started) {
        started = true;
        for (const t of templateCatalog()) {
            renderer
                .render(
                    {
                        size: [SIZE, SIZE],
                        seed: 1234,
                        background: '#1c1c1c',
                        patches: [{ patch: { template: t.name }, width: 100, height: 100 }],
                    },
                    `thumbnail-${t.name}`
                )
                .then((rendered) => {
                    if (rendered) {
                        thumbnails[t.name] = rendered.image;
                    }
                })
                .catch(() => undefined);
        }
    }
    return thumbnails;
}
