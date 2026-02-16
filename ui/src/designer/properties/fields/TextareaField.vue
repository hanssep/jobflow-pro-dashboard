<template>
    <v-textarea
        :model-value="modelValue"
        :label="label"
        density="compact"
        variant="outlined"
        hide-details="auto"
        rows="3"
        auto-grow
        @update:model-value="$emit('update:modelValue', $event)"
    />
</template>

<script>
export default {
    name: 'DesignerTextareaField',
    props: {
        modelValue: { type: String, default: '' },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue']
}
</script>
