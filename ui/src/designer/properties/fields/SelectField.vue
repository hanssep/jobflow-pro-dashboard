<template>
    <v-select
        :model-value="modelValue"
        :label="label"
        :items="items"
        density="compact"
        variant="outlined"
        hide-details="auto"
        @update:model-value="$emit('update:modelValue', $event)"
    />
</template>

<script>
export default {
    name: 'DesignerSelectField',
    props: {
        modelValue: { type: [String, Number, Boolean, Array], default: '' },
        label: { type: String, default: '' },
        items: { type: Array, default: () => [] }
    },
    emits: ['update:modelValue']
}
</script>
