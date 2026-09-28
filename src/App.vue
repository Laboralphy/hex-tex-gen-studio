<script setup lang="ts">
/**
 * The studio: a base texture picked from the walls and grounds, its essential parameters,
 * decorations over it, and a live preview to export.
 */
import { computed, ref } from 'vue';
import DecorationList from './components/DecorationList.vue';
import ExportBar from './components/ExportBar.vue';
import ParameterForm from './components/ParameterForm.vue';
import TemplateGallery from './components/TemplateGallery.vue';
import TextureCanvas from './components/TextureCanvas.vue';
import { usePreview } from './composables/usePreview';
import { BASE_CATEGORIES, SIZE_PRESETS } from './libs/recipe';
import { useRecipeStore } from './stores/recipe';

const store = useRecipeStore();
const { image, error, time } = usePreview();
const zoom = ref(4);
const tiled = ref(false);

const size = computed(() => store.recipe.size);
function setSize(index: number, value: number): void {
    const next: [number, number] = [...store.recipe.size];
    next[index] = Math.max(8, Math.min(512, Math.round(value)));
    store.recipe.size = next;
}
</script>

<template>
    <div class="studio">
        <header>
            <h1>Hex-Tex-Gen Studio</h1>
            <span class="sizes">
                <button
                    v-for="preset in SIZE_PRESETS"
                    :key="preset.label"
                    type="button"
                    :class="{ active: preset.size[0] === size[0] && preset.size[1] === size[1] }"
                    @click="store.recipe.size = [...preset.size]"
                >
                    {{ preset.label }}
                </button>
                <input
                    type="number"
                    :value="size[0]"
                    @change="setSize(0, Number(($event.target as HTMLInputElement).value))"
                />
                ×
                <input
                    type="number"
                    :value="size[1]"
                    @change="setSize(1, Number(($event.target as HTMLInputElement).value))"
                />
            </span>
            <span class="seed">
                seed
                <input v-model.number="store.recipe.seed" type="number" />
                <button type="button" @click="store.reroll()">reroll</button>
            </span>
        </header>
        <aside class="templates">
            <TemplateGallery
                :categories="BASE_CATEGORIES"
                :selected="store.recipe.base.template"
                @pick="store.setBaseTemplate"
            />
        </aside>
        <main class="preview">
            <div class="view">
                <TextureCanvas :image="image" :zoom="zoom" :tiled="tiled" />
            </div>
            <div class="tools">
                <label>
                    zoom
                    <select v-model.number="zoom">
                        <option v-for="z in [1, 2, 3, 4, 6, 8]" :key="z" :value="z">
                            {{ z }}×
                        </option>
                    </select>
                </label>
                <label><input v-model="tiled" type="checkbox" /> tiled 3 × 3</label>
                <span class="time">{{ time.toFixed(0) }} ms</span>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
            <ExportBar :image="image" />
        </main>
        <section class="base">
            <h2>{{ store.recipe.base.template }}</h2>
            <ParameterForm layer-id="base" />
        </section>
        <section class="decorations">
            <h2>Decorations</h2>
            <DecorationList />
        </section>
    </div>
</template>

<style scoped>
.studio {
    display: grid;
    grid-template-columns: 16em 1fr 26em;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        'header header header'
        'templates preview base'
        'templates decorations base';
    gap: 0.8em;
    height: 100vh;
    padding: 0.6em;
    box-sizing: border-box;
}
header {
    grid-area: header;
    display: flex;
    gap: 1.5em;
    align-items: center;
}
h1 {
    font-size: 1.1em;
    margin: 0;
}
h2 {
    font-size: 0.95em;
    margin: 0 0 0.4em;
}
.sizes,
.seed {
    display: flex;
    gap: 0.3em;
    align-items: center;
}
.sizes input,
.seed input {
    width: 5em;
}
.active {
    border-color: var(--accent);
}
.templates {
    grid-area: templates;
    overflow-y: auto;
}
.preview {
    grid-area: preview;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    min-height: 0;
}
.view {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
}
.tools {
    display: flex;
    gap: 1em;
    align-items: center;
    font-size: 0.85em;
}
.time {
    color: var(--muted);
}
.error {
    color: #e66;
    font-size: 0.85em;
    margin: 0;
}
.base {
    grid-area: base;
    overflow-y: auto;
}
.decorations {
    grid-area: decorations;
    overflow-y: auto;
    max-height: 40vh;
}
</style>
