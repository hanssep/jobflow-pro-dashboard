<template>
    <div class="designer-slider-field">
        <label class="designer-slider-field__label">{{ label }}</label>
        <v-slider
            :model-value="modelValue"
            :min="min"
            :max="max"
            :step="step"
            density="compact"
            hide-details="auto"
            thumb-label
            color="primary"
            @update:model-value="$emit('update:modelValue', $event)"
        >
            <template #append>
                <span class="designer-slider-field__value">{{ modelValue }}</span>
            </template>
        </v-slider>
    </div>
</template>

<script>
export default {
    name: 'DesignerSliderField',
    props: {
        modelValue: { type: Number, default: 0 },
        label: { type: String, default: '' },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        step: { type: Number, default: 1 }
    },
    emits: ['update:modelValue']
}
</script>

<style scoped>
.designer-slider-field__label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 2px;
}
.designer-slider-field__value {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 28px;
    text-align: right;
    color: rgba(var(--v-theme-on-surface), 0.8);
}
</style>
