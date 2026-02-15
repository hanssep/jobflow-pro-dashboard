<template>
    <div class="designer-color-field">
        <v-text-field
            :model-value="modelValue"
            :label="label"
            density="compact"
            variant="outlined"
            hide-details="auto"
            @update:model-value="$emit('update:modelValue', $event)"
        >
            <template #prepend-inner>
                <div
                    class="designer-color-field__swatch"
                    :style="{ backgroundColor: modelValue || 'transparent' }"
                    @click="showPicker = !showPicker"
                />
            </template>
        </v-text-field>
        <v-menu v-model="showPicker" :close-on-content-click="false" location="bottom start" offset="4">
            <template #activator="{ props }">
                <span v-bind="props" />
            </template>
            <v-color-picker
                :model-value="modelValue || '#ffffff'"
                mode="hexa"
                hide-inputs
                @update:model-value="$emit('update:modelValue', $event)"
            />
        </v-menu>
    </div>
</template>

<script>
export default {
    name: 'DesignerColorField',
    props: {
        modelValue: { type: String, default: '' },
        label: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    data () {
        return { showPicker: false }
    }
}
</script>

<style scoped>
.designer-color-field {
    position: relative;
}
.designer-color-field__swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    cursor: pointer;
    flex-shrink: 0;
}
</style>
