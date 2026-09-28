import { onUnmounted, ref, shallowRef, watch } from 'vue';
import { renderer } from '../libs/renderer';
import { useRecipeStore } from '../stores/recipe';

/** delay after the last change before rendering, in milliseconds */
const DEBOUNCE = 80;

/**
 * The texture of the recipe, rendered again after each change: the latest image, the
 * error of the latest render if it failed, and its duration.
 */
export function usePreview() {
    const store = useRecipeStore();
    const image = shallowRef<ImageData>();
    const error = ref<string>();
    const time = ref(0);
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function render(): Promise<void> {
        try {
            const rendered = await renderer.render(store.definition, 'preview');
            if (rendered) {
                image.value = rendered.image;
                time.value = rendered.time;
                error.value = undefined;
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : String(e);
        }
    }

    watch(
        () => store.definition,
        () => {
            clearTimeout(timer);
            timer = setTimeout(render, DEBOUNCE);
        },
        { deep: true, immediate: true }
    );
    onUnmounted(() => clearTimeout(timer));

    return { image, error, time };
}
