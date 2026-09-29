<script setup lang="ts">
/**
 * One field of a parameter form: the widget follows the kind of the parameter, as
 * described by the library. An unset parameter shows its default; a wear parameter
 * derived from age shows "auto" until it is overridden.
 */
import type { ParameterInfo } from '@laboralphy/hex-tex-gen';
import { computed, ref, watch } from 'vue';
import { interpolatePalette, toHexColor } from '../libs/colors';
import { sliderBounds } from '../libs/parameters';

const props = defineProps<{
    info: ParameterInfo;
    /** the value set by the user; undefined when left to its default */
    value: unknown;
}>();

const emit = defineEmits<{ update: [value: unknown]; reset: [] }>();

const isSet = computed(() => props.value !== undefined);
const current = computed(() => (isSet.value ? props.value : props.info.default));
const auto = computed(() => props.info.fromAge && !isSet.value);
const label = computed(() => props.info.path.replace(/\./g, ' › '));

/** a starting value for a parameter derived from age, when it is overridden */
function initialValue(): unknown {
    const min = props.info.minimum ?? 0;
    switch (props.info.kind) {
        case 'range':
        case 'pair':
            return [min, min + 1];
        case 'integer':
            return Math.round(min);
        default:
            return min;
    }
}

function toggleAuto(event: Event): void {
    if ((event.target as HTMLInputElement).checked) {
        emit('reset');
    } else {
        emit('update', initialValue());
    }
}

const step = computed(() => {
    if (props.info.kind === 'integer') {
        return 1;
    }
    const { minimum, maximum } = props.info;
    return minimum !== undefined && maximum !== undefined && maximum - minimum <= 2 ? 0.01 : 0.1;
});
const slider = computed(() => sliderBounds(props.info));

function number(event: Event): void {
    const n = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(n)) {
        emit('update', props.info.kind === 'integer' ? Math.round(n) : n);
    }
}

function pairItem(index: number, event: Event): void {
    const n = Number((event.target as HTMLInputElement).value);
    const pair = [...((current.value as number[]) ?? [0, 0])];
    pair[index] = n;
    emit('update', pair);
}

const colors = computed(() => (Array.isArray(current.value) ? (current.value as string[]) : []));

function colorItem(index: number, event: Event): void {
    const list = [...colors.value];
    list[index] = (event.target as HTMLInputElement).value;
    emit('update', list);
}

function addColor(): void {
    emit('update', [...colors.value, colors.value[colors.value.length - 1] ?? '#808080']);
}

function removeColor(): void {
    if (colors.value.length > 2) {
        emit('update', colors.value.slice(0, -1));
    }
}

function choice(option: string, event: Event): void {
    const list = new Set((current.value as string[]) ?? []);
    if ((event.target as HTMLInputElement).checked) {
        list.add(option);
    } else {
        list.delete(option);
    }
    emit('update', [...list]);
}

// JSON fields are edited as text, and applied once they parse
const json = ref('');
const jsonError = ref(false);
watch(
    current,
    (value) => {
        json.value = JSON.stringify(value);
        jsonError.value = false;
    },
    { immediate: true }
);
function applyJson(): void {
    try {
        emit('update', JSON.parse(json.value));
        jsonError.value = false;
    } catch {
        jsonError.value = true;
    }
}
</script>

<template>
    <div class="field" :class="{ set: isSet }" :title="info.description">
        <label class="name">
            {{ label }}
            <span v-if="info.scale" class="scale">{{ info.scale }}</span>
        </label>
        <div class="control">
            <label v-if="info.fromAge" class="auto">
                <input type="checkbox" :checked="auto" @change="toggleAuto" />
                auto (from age)
            </label>
            <template v-if="!auto">
                <template v-if="info.kind === 'number' || info.kind === 'integer'">
                    <input
                        v-if="slider"
                        type="range"
                        :min="slider[0]"
                        :max="slider[1]"
                        :step="step"
                        :value="current as number"
                        @input="number"
                    />
                    <input
                        type="number"
                        class="number"
                        :min="info.minimum"
                        :max="info.maximum"
                        :step="step"
                        :value="current as number"
                        @change="number"
                    />
                </template>
                <input
                    v-else-if="info.kind === 'boolean'"
                    type="checkbox"
                    :checked="current as boolean"
                    @change="emit('update', ($event.target as HTMLInputElement).checked)"
                />
                <select
                    v-else-if="info.kind === 'enum'"
                    :value="current as string"
                    @change="emit('update', ($event.target as HTMLSelectElement).value)"
                >
                    <option v-for="option in info.options" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
                <input
                    v-else-if="info.kind === 'color'"
                    type="color"
                    :value="toHexColor(current as string)"
                    @input="emit('update', ($event.target as HTMLInputElement).value)"
                />
                <span v-else-if="info.kind === 'palette' || info.kind === 'colors'" class="colors">
                    <input
                        v-for="(c, i) in colors"
                        :key="i"
                        type="color"
                        :value="toHexColor(c)"
                        @input="colorItem(i, $event)"
                    />
                    <template v-if="info.kind === 'palette'">
                        <button type="button" title="one more color" @click="addColor">+</button>
                        <button type="button" title="one color less" @click="removeColor">−</button>
                    </template>
                    <button
                        v-if="colors.length > 2"
                        type="button"
                        title="the colors between the first and the last, as an even gradient"
                        @click="emit('update', interpolatePalette(colors))"
                    >
                        interpolate
                    </button>
                </span>
                <span v-else-if="info.kind === 'range' || info.kind === 'pair'" class="pair">
                    <input
                        v-for="i in [0, 1]"
                        :key="i"
                        type="number"
                        class="number"
                        :step="step"
                        :value="(current as number[])?.[i]"
                        @change="pairItem(i, $event)"
                    />
                </span>
                <span v-else-if="info.kind === 'choices'" class="choices">
                    <label v-for="option in info.options" :key="option">
                        <input
                            type="checkbox"
                            :checked="((current as string[]) ?? []).includes(option)"
                            @change="choice(option, $event)"
                        />
                        {{ option }}
                    </label>
                </span>
                <input
                    v-else-if="info.kind === 'text'"
                    type="text"
                    :value="current as string"
                    @change="emit('update', ($event.target as HTMLInputElement).value)"
                />
                <textarea
                    v-else
                    v-model="json"
                    :class="{ invalid: jsonError }"
                    rows="2"
                    @change="applyJson"
                ></textarea>
            </template>
            <button
                v-if="isSet && !info.fromAge"
                type="button"
                class="reset"
                title="back to the default"
                @click="emit('reset')"
            >
                ↺
            </button>
        </div>
    </div>
</template>

<style scoped>
.field {
    display: grid;
    grid-template-columns: 11em 1fr;
    gap: 0.5em;
    align-items: center;
    padding: 0.15em 0;
}
.name {
    font-size: 0.85em;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.set .name {
    color: var(--text);
}
.scale {
    font-size: 0.75em;
    opacity: 0.6;
}
.control {
    display: flex;
    gap: 0.4em;
    align-items: center;
    flex-wrap: wrap;
}
.number {
    width: 5em;
}
.colors input[type='color'] {
    width: 1.8em;
    height: 1.6em;
    padding: 0;
}
.auto {
    font-size: 0.8em;
    color: var(--muted);
}
.reset {
    padding: 0 0.4em;
}
.invalid {
    outline: 1px solid #c33;
}
</style>
