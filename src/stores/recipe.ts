import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
    newDecoration,
    toDefinition,
    type Decoration,
    type Layer,
    type Recipe,
} from '../libs/recipe';

/**
 * The texture being designed.
 */
export const useRecipeStore = defineStore('recipe', () => {
    const recipe = ref<Recipe>({
        size: [64, 96],
        seed: 1234,
        base: { id: 'base', template: 'ashlar', values: {} },
        decorations: [],
    });

    const definition = computed(() => toDefinition(recipe.value));

    function layer(id: string): Layer | undefined {
        return id === 'base'
            ? recipe.value.base
            : recipe.value.decorations.find((d) => d.id === id);
    }

    function setValue(id: string, path: string, value: unknown): void {
        const target = layer(id);
        if (target) {
            target.values = { ...target.values, [path]: value };
        }
    }

    function resetValue(id: string, path: string): void {
        const target = layer(id);
        if (target) {
            const { [path]: _, ...rest } = target.values;
            target.values = rest;
        }
    }

    function setBaseTemplate(template: string): void {
        recipe.value.base = { id: 'base', template, values: {} };
        // anchors of the old base may not exist on the new one
        for (const d of recipe.value.decorations) {
            if (d.mode === 'anchor' && d.target === 'base') {
                d.mode = 'free';
            }
        }
    }

    function addDecoration(template: string): void {
        recipe.value.decorations.push(newDecoration(template, recipe.value.size));
    }

    function updateDecoration(id: string, change: Partial<Decoration>): void {
        const d = recipe.value.decorations.find((d) => d.id === id);
        if (d) {
            Object.assign(d, change);
        }
    }

    function removeDecoration(id: string): void {
        recipe.value.decorations = recipe.value.decorations.filter(
            (d) => d.id !== id && !(d.mode === 'anchor' && d.target === id)
        );
    }

    function moveDecoration(id: string, step: -1 | 1): void {
        const list = recipe.value.decorations;
        const i = list.findIndex((d) => d.id === id);
        const j = i + step;
        if (i >= 0 && j >= 0 && j < list.length) {
            [list[i], list[j]] = [list[j], list[i]];
        }
    }

    function reroll(): void {
        recipe.value.seed = Math.floor(Math.random() * 1_000_000);
    }

    function load(loaded: Recipe): void {
        recipe.value = loaded;
    }

    return {
        recipe,
        definition,
        layer,
        setValue,
        resetValue,
        setBaseTemplate,
        addDecoration,
        updateDecoration,
        removeDecoration,
        moveDecoration,
        reroll,
        load,
    };
});
