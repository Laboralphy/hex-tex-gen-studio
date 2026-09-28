<script setup lang="ts">
/**
 * The form of a layer: its essential parameters, or all of them.
 */
import { describeParameters, generators } from '@laboralphy/hex-tex-gen';
import { computed, ref } from 'vue';
import { useRecipeStore } from '../stores/recipe';
import ParameterField from './ParameterField.vue';

const props = defineProps<{ layerId: string }>();

const store = useRecipeStore();
const all = ref(false);
const layer = computed(() => store.layer(props.layerId));
const parameters = computed(() => {
    const generator = layer.value && generators[layer.value.template];
    return generator ? describeParameters(generator) : [];
});
const shown = computed(() => parameters.value.filter((p) => all.value || p.essential));
const changed = computed(() => Object.keys(layer.value?.values ?? {}).length);
</script>

<template>
    <div v-if="layer" class="form">
        <div class="bar">
            <label>
                <input v-model="all" type="checkbox" />
                all parameters ({{ parameters.length }})
            </label>
            <span v-if="changed" class="changed">{{ changed }} changed</span>
        </div>
        <ParameterField
            v-for="info in shown"
            :key="info.path"
            :info="info"
            :value="layer.values[info.path]"
            @update="store.setValue(layerId, info.path, $event)"
            @reset="store.resetValue(layerId, info.path)"
        />
    </div>
</template>

<style scoped>
.bar {
    display: flex;
    justify-content: space-between;
    font-size: 0.85em;
    color: var(--muted);
    margin-bottom: 0.3em;
}
</style>
