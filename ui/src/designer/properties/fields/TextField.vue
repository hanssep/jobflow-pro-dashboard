<template>
    <v-text-field
        :model-value="modelValue"
        :label="label"
        density="compact"
        variant="outlined"
        hide-details="auto"
        @update:model-value="$emit('update:modelValue', $event)"
    />
</template>

<script>
export default {
    name: 'DesignerTextField',
    props: {
        modelValue: { type: [String, Number], default: '' },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue']
}
</script>
