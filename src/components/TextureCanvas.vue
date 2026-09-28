<script setup lang="ts">
/**
 * Draws an `ImageData`, enlarged with crisp pixels, maybe tiled to check its seams.
 */
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        image?: ImageData;
        zoom?: number;
        /** repeats the image 3 × 3 */
        tiled?: boolean;
    }>(),
    { image: undefined, zoom: 1, tiled: false }
);

const canvas = ref<HTMLCanvasElement>();

function draw(): void {
    const target = canvas.value;
    const image = props.image;
    if (!target || !image) {
        return;
    }
    const repeat = props.tiled ? 3 : 1;
    target.width = image.width * repeat;
    target.height = image.height * repeat;
    const ctx = target.getContext('2d');
    if (!ctx) {
        return;
    }
    for (let y = 0; y < repeat; ++y) {
        for (let x = 0; x < repeat; ++x) {
            ctx.putImageData(image, x * image.width, y * image.height);
        }
    }
    target.style.width = `${target.width * props.zoom}px`;
    target.style.height = `${target.height * props.zoom}px`;
}

onMounted(draw);
watch(() => [props.image, props.zoom, props.tiled], draw);

defineExpose({ canvas });
</script>

<template>
    <canvas ref="canvas" class="texture"></canvas>
</template>

<style scoped>
.texture {
    image-rendering: pixelated;
    background: repeating-conic-gradient(#2a2a2a 0 25%, #333 0 50%) 0 0 / 8px 8px;
}
</style>
