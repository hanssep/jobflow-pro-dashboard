<template>
    <v-switch
        :model-value="modelValue"
        :label="label"
        density="compact"
        hide-details="auto"
        color="primary"
        @update:model-value="$emit('update:modelValue', $event)"
    />
</template>

<script>
export default {
    name: 'DesignerBooleanField',
    props: {
        modelValue: { type: Boolean, default: false },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue']
}
</script>
