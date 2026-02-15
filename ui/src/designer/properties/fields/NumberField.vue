<template>
    <v-text-field
        :model-value="modelValue"
        :label="label"
        type="number"
        density="compact"
        variant="outlined"
        hide-details="auto"
        @update:model-value="$emit('update:modelValue', parseFloat($event) || 0)"
    />
</template>

<script>
export default {
    name: 'DesignerNumberField',
    props: {
        modelValue: { type: Number, default: 0 },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue']
}
</script>
