import type { TextureDefinition } from '@laboralphy/hex-tex-gen';
import type { RenderRequest, RenderResponse } from '../workers/render.worker';

/** a rendered texture, ready to draw */
export type Rendered = { image: ImageData; time: number };

/**
 * A pool of render workers. Each request is answered with an `ImageData`; requests on the
 * same channel supersede each other: only the latest one is answered, so that dragging a
 * slider never queues up stale renders.
 */
export class Renderer {
    private readonly workers: Worker[];
    private nextId = 1;
    private readonly pending = new Map<
        number,
        { resolve: (r: Rendered) => void; reject: (e: Error) => void }
    >();
    /** latest request id of each channel */
    private readonly latest = new Map<string, number>();
    private turn = 0;

    constructor(size = Math.max(1, Math.min(4, (navigator.hardwareConcurrency ?? 2) - 1))) {
        this.workers = Array.from({ length: size }, () => {
            const worker = new Worker(new URL('../workers/render.worker.ts', import.meta.url), {
                type: 'module',
            });
            worker.onmessage = (event: MessageEvent<RenderResponse>) => this.answer(event.data);
            return worker;
        });
    }

    private answer(response: RenderResponse): void {
        const request = this.pending.get(response.id);
        this.pending.delete(response.id);
        if (!request) {
            return;
        }
        if ('error' in response) {
            request.reject(new Error(response.error));
            return;
        }
        const pixels = new Uint8ClampedArray(response.pixels);
        request.resolve({
            image: new ImageData(pixels, response.width, response.height),
            time: response.time,
        });
    }

    /**
     * Renders a definition.
     * @param channel requests on a channel supersede each other
     * @returns undefined when a later request on the channel superseded this one
     */
    async render(definition: TextureDefinition, channel: string): Promise<Rendered | undefined> {
        const id = this.nextId++;
        this.latest.set(channel, id);
        const worker = this.workers[this.turn++ % this.workers.length];
        const result = await new Promise<Rendered>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            // a JSON copy, not structuredClone: the definitions of the store hold Vue
            // proxies, which cannot be cloned
            const request: RenderRequest = {
                id,
                definition: JSON.parse(JSON.stringify(definition)) as TextureDefinition,
            };
            worker.postMessage(request);
        });
        return this.latest.get(channel) === id ? result : undefined;
    }
}

/** the renderer of the app */
export const renderer = new Renderer();
