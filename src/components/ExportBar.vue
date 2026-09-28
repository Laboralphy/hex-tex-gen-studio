<script setup lang="ts">
/**
 * What leaves the studio: the texture as a PNG file or as a data URL, the form the map
 * editor keeps its tiles in, and the recipe, to generate the texture again later.
 */
import { ref } from 'vue';
import { imageToDataUrl } from '../libs/png';
import type { Recipe } from '../libs/recipe';
import { useRecipeStore } from '../stores/recipe';

const props = defineProps<{ image?: ImageData }>();

const store = useRecipeStore();
const message = ref('');

function say(text: string): void {
    message.value = text;
    setTimeout(() => (message.value = ''), 2500);
}

function download(href: string, name: string): void {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.click();
}

function name(): string {
    const [w, h] = store.recipe.size;
    return `${store.recipe.base.template}-${w}x${h}-${store.recipe.seed}`;
}

function downloadPng(): void {
    if (props.image) {
        download(imageToDataUrl(props.image), `${name()}.png`);
    }
}

async function copyDataUrl(): Promise<void> {
    if (props.image) {
        await navigator.clipboard.writeText(imageToDataUrl(props.image));
        say('PNG data URL copied');
    }
}

function downloadRecipe(): void {
    const json = JSON.stringify(store.recipe, null, 2);
    download(URL.createObjectURL(new Blob([json], { type: 'application/json' })), `${name()}.json`);
}

async function importRecipe(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
        return;
    }
    try {
        store.load(JSON.parse(await file.text()) as Recipe);
        say('recipe loaded');
    } catch {
        say('not a recipe');
    }
}
</script>

<template>
    <div class="export">
        <button type="button" :disabled="!image" @click="downloadPng">PNG</button>
        <button type="button" :disabled="!image" @click="copyDataUrl">copy data URL</button>
        <button type="button" @click="downloadRecipe">save recipe</button>
        <label class="import">
            load recipe
            <input type="file" accept="application/json" @change="importRecipe" />
        </label>
        <span class="message">{{ message }}</span>
    </div>
</template>

<style scoped>
.export {
    display: flex;
    gap: 0.4em;
    align-items: center;
    flex-wrap: wrap;
}
.import input {
    display: none;
}
.import {
    cursor: pointer;
    padding: 0.2em 0.6em;
    border: 1px solid var(--border);
}
.message {
    color: var(--accent);
    font-size: 0.85em;
}
</style>
