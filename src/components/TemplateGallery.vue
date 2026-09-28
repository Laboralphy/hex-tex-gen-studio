<script setup lang="ts">
/**
 * The templates of some categories, as thumbnails rendered on the fly: picking a texture
 * by its look rather than by its name.
 */
import { templateCatalog, type Category } from '@laboralphy/hex-tex-gen';
import { computed } from 'vue';
import TextureCanvas from './TextureCanvas.vue';
import { useThumbnails } from '../composables/useThumbnails';

const props = defineProps<{
    categories: Category[];
    selected?: string;
}>();

const emit = defineEmits<{ pick: [template: string] }>();

const groups = computed(() =>
    props.categories.map((category) => ({
        category,
        templates: templateCatalog().filter((t) => t.category === category),
    }))
);
const thumbnails = useThumbnails();
</script>

<template>
    <div class="gallery">
        <section v-for="group in groups" :key="group.category">
            <h3>{{ group.category }}</h3>
            <div class="grid">
                <button
                    v-for="t in group.templates"
                    :key="t.name"
                    type="button"
                    class="thumb"
                    :class="{ selected: t.name === selected }"
                    :title="t.description"
                    @click="emit('pick', t.name)"
                >
                    <TextureCanvas :image="thumbnails[t.name]" :zoom="1" />
                    <span>{{ t.name }}</span>
                </button>
            </div>
        </section>
    </div>
</template>

<style scoped>
h3 {
    margin: 0.6em 0 0.3em;
    font-size: 0.8em;
    text-transform: uppercase;
    color: var(--muted);
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 0.4em;
}
.thumb {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2em;
    padding: 0.3em;
    background: var(--panel);
    border: 1px solid transparent;
    font-size: 0.75em;
}
.thumb.selected {
    border-color: var(--accent);
}
</style>
