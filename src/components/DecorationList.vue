<script setup lang="ts">
/**
 * The decorations laid over the base, in drawing order: each placed freely, in percent of
 * the texture, or repeated on the anchors of a layer under it.
 */
import { templateCatalog } from '@laboralphy/hex-tex-gen';
import { computed, ref } from 'vue';
import { anchorTargets, DECORATION_CATEGORIES, type Decoration } from '../libs/recipe';
import { useRecipeStore } from '../stores/recipe';
import ParameterForm from './ParameterForm.vue';

const store = useRecipeStore();
const catalog = templateCatalog();
const decorative = catalog.filter((t) => DECORATION_CATEGORIES.includes(t.category));
const adding = ref(decorative[0]?.name ?? '');
const open = ref<string>();

const decorations = computed(() => store.recipe.decorations);

function anchorsOf(target: string): string[] {
    const layer = store.layer(target);
    const info = catalog.find((t) => t.name === layer?.template);
    return Object.keys(info?.anchors ?? {});
}

function setMode(d: Decoration, mode: 'free' | 'anchor', index: number): void {
    if (mode === 'anchor') {
        const target = anchorTargets(store.recipe, index)[0];
        if (!target) {
            return;
        }
        store.updateDecoration(d.id, {
            mode,
            target: target.id,
            anchor: anchorsOf(target.id)[0] ?? '',
        });
    } else {
        store.updateDecoration(d.id, { mode });
    }
}

function setTarget(d: Decoration, target: string): void {
    store.updateDecoration(d.id, { target, anchor: anchorsOf(target)[0] ?? '' });
}

function num(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
}

function add(): void {
    store.addDecoration(adding.value);
    open.value = store.recipe.decorations[store.recipe.decorations.length - 1]?.id;
}
</script>

<template>
    <div class="decorations">
        <div class="add">
            <select v-model="adding">
                <optgroup
                    v-for="category in DECORATION_CATEGORIES"
                    :key="category"
                    :label="category"
                >
                    <option
                        v-for="t in decorative.filter((t) => t.category === category)"
                        :key="t.name"
                        :value="t.name"
                    >
                        {{ t.name }}
                    </option>
                </optgroup>
            </select>
            <button type="button" @click="add">add a decoration</button>
        </div>
        <div v-for="(d, index) in decorations" :key="d.id" class="decoration">
            <div class="head">
                <strong>{{ d.template }}</strong>
                <span class="id">{{ d.id }}</span>
                <span class="actions">
                    <button
                        type="button"
                        title="drawn earlier"
                        @click="store.moveDecoration(d.id, -1)"
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        title="drawn later"
                        @click="store.moveDecoration(d.id, 1)"
                    >
                        ↓
                    </button>
                    <button type="button" @click="open = open === d.id ? undefined : d.id">
                        {{ open === d.id ? 'close' : 'edit' }}
                    </button>
                    <button type="button" title="remove" @click="store.removeDecoration(d.id)">
                        ✕
                    </button>
                </span>
            </div>
            <div class="placement">
                <label>
                    <input
                        type="radio"
                        :checked="d.mode === 'free'"
                        @change="setMode(d, 'free', index)"
                    />
                    placed
                </label>
                <label>
                    <input
                        type="radio"
                        :checked="d.mode === 'anchor'"
                        :disabled="anchorTargets(store.recipe, index).length === 0"
                        @change="setMode(d, 'anchor', index)"
                    />
                    on anchors
                </label>
            </div>
            <div class="grid">
                <template v-if="d.mode === 'free'">
                    <label
                        >x %
                        <input
                            type="number"
                            :value="d.x"
                            @change="store.updateDecoration(d.id, { x: num($event) })"
                    /></label>
                    <label
                        >y %
                        <input
                            type="number"
                            :value="d.y"
                            @change="store.updateDecoration(d.id, { y: num($event) })"
                    /></label>
                </template>
                <template v-else>
                    <label>
                        on
                        <select
                            :value="d.target"
                            @change="setTarget(d, ($event.target as HTMLSelectElement).value)"
                        >
                            <option
                                v-for="t in anchorTargets(store.recipe, index)"
                                :key="t.id"
                                :value="t.id"
                            >
                                {{ t.id }} ({{ t.template }})
                            </option>
                        </select>
                    </label>
                    <label>
                        at
                        <select
                            :value="d.anchor"
                            @change="
                                store.updateDecoration(d.id, {
                                    anchor: ($event.target as HTMLSelectElement).value,
                                })
                            "
                        >
                            <option v-for="a in anchorsOf(d.target)" :key="a" :value="a">
                                {{ a }}
                            </option>
                        </select>
                    </label>
                    <label
                        >share
                        <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            :value="d.ratio"
                            @change="store.updateDecoration(d.id, { ratio: num($event) })"
                    /></label>
                    <label
                        ><input
                            type="checkbox"
                            :checked="d.mirror"
                            @change="
                                store.updateDecoration(d.id, {
                                    mirror: ($event.target as HTMLInputElement).checked,
                                })
                            "
                        />
                        mirror on corners</label
                    >
                </template>
                <label
                    >width %
                    <input
                        type="number"
                        min="1"
                        :value="d.width"
                        @change="store.updateDecoration(d.id, { width: num($event) })"
                /></label>
                <label
                    >height %
                    <input
                        type="number"
                        min="1"
                        :value="d.height"
                        @change="store.updateDecoration(d.id, { height: num($event) })"
                /></label>
                <label
                    >opacity
                    <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        :value="d.opacity"
                        @change="store.updateDecoration(d.id, { opacity: num($event) })"
                /></label>
            </div>
            <ParameterForm v-if="open === d.id" :layer-id="d.id" />
        </div>
    </div>
</template>

<style scoped>
.add {
    display: flex;
    gap: 0.4em;
    margin-bottom: 0.6em;
}
.decoration {
    background: var(--panel);
    padding: 0.5em;
    margin-bottom: 0.5em;
}
.head {
    display: flex;
    gap: 0.5em;
    align-items: center;
}
.id {
    color: var(--muted);
    font-size: 0.8em;
}
.actions {
    margin-left: auto;
    display: flex;
    gap: 0.2em;
}
.placement {
    display: flex;
    gap: 1em;
    font-size: 0.85em;
    margin: 0.3em 0;
}
.grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em 1em;
    font-size: 0.85em;
}
.grid input[type='number'] {
    width: 4.5em;
}
</style>
