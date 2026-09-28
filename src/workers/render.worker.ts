/// <reference lib="webworker" />
import { createMemoryLoader, renderTexture, type TextureDefinition } from '@laboralphy/hex-tex-gen';

/** a request to the renderer */
export type RenderRequest = { id: number; definition: TextureDefinition };

/** the answer: pixels, or why there are none */
export type RenderResponse =
    | { id: number; width: number; height: number; pixels: ArrayBuffer; time: number }
    | { id: number; error: string };

/**
 * Renders texture definitions off the main thread, so that the forms stay responsive
 * while a texture is generated. The pixels are transferred, not copied.
 */
self.onmessage = (event: MessageEvent<RenderRequest>) => {
    const { id, definition } = event.data;
    const start = performance.now();
    try {
        const texture = renderTexture(definition, createMemoryLoader({}));
        const pixels = texture.data.slice().buffer;
        const response: RenderResponse = {
            id,
            width: texture.width,
            height: texture.height,
            pixels,
            time: performance.now() - start,
        };
        self.postMessage(response, [pixels]);
    } catch (e) {
        self.postMessage({ id, error: e instanceof Error ? e.message : String(e) });
    }
};
