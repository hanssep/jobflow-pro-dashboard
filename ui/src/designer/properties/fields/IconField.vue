<template>
    <v-text-field
        :model-value="modelValue"
        :label="label"
        density="compact"
        variant="outlined"
        hide-details="auto"
        placeholder="e.g. mdi-home"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template v-if="modelValue" #prepend-inner>
            <v-icon size="20">{{ modelValue }}</v-icon>
        </template>
    </v-text-field>
</template>

<script>
export default {
    name: 'DesignerIconField',
    props: {
        modelValue: { type: String, default: '' },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue']
}
</script>
