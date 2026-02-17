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
            <template v-if="themeToken" #append-inner>
                <v-tooltip location="top">
                    <template #activator="{ props }">
                        <span v-bind="props" class="designer-color-field__token">
                            <span
                                v-if="isOverridden"
                                class="designer-color-field__override-dot"
                            />
                            <span v-else class="designer-color-field__theme-badge">theme</span>
                        </span>
                    </template>
                    <span>Theme: {{ themeTokenLabel }}</span>
                </v-tooltip>
                <v-btn
                    v-if="isOverridden"
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    density="compact"
                    @click="$emit('update:modelValue', themeValue)"
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
        label: { type: String, default: '' },
        themeToken: { type: String, default: null },
        themeValue: { type: String, default: null }
    },
    emits: ['update:modelValue'],
    data () {
        return { showPicker: false }
    },
    computed: {
        themeTokenLabel () {
            if (!this.themeToken) return ''
            // Capitalize first letter
            return this.themeToken.charAt(0).toUpperCase() + this.themeToken.slice(1)
        },
        isOverridden () {
            if (!this.themeToken || !this.themeValue) return false
            return this.modelValue && this.modelValue.toLowerCase() !== this.themeValue.toLowerCase()
        }
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
.designer-color-field__token {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.designer-color-field__theme-badge {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(var(--v-theme-on-surface), 0.4);
    background: rgba(var(--v-theme-primary), 0.08);
    padding: 1px 5px;
    border-radius: 3px;
}
.designer-color-field__override-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--v-theme-warning));
    flex-shrink: 0;
}
</style>
