<template>
    <div class="theme-selector">
        <v-select
            :model-value="modelValue"
            :items="themeOptions"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Select theme"
            @update:model-value="$emit('update:modelValue', $event)"
        >
            <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                    <template #prepend>
                        <div class="theme-selector__swatches">
                            <div
                                v-for="color in item.raw.colors"
                                :key="color"
                                class="theme-selector__swatch"
                                :style="{ backgroundColor: color }"
                            />
                        </div>
                    </template>
                </v-list-item>
            </template>
            <template #selection="{ item }">
                <div class="theme-selector__selected">
                    <div class="theme-selector__swatches">
                        <div
                            v-for="color in item.raw.colors"
                            :key="color"
                            class="theme-selector__swatch"
                            :style="{ backgroundColor: color }"
                        />
                    </div>
                    <span>{{ item.title }}</span>
                </div>
            </template>
        </v-select>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'ThemeSelector',
    props: {
        modelValue: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    computed: {
        ...mapState('ui', ['themes']),
        themeOptions () {
            if (!this.themes) return []
            return Object.values(this.themes).map(t => ({
                label: t.name || 'Default Theme',
                value: t.id,
                colors: [
                    t.colors?.primary || '#0094CE',
                    t.colors?.bgPage || '#eeeeee',
                    t.colors?.groupBg || '#ffffff',
                    t.colors?.surface || '#ffffff'
                ]
            }))
        }
    }
}
</script>

<style scoped>
.theme-selector__swatches {
    display: flex;
    gap: 3px;
    margin-right: 8px;
}
.theme-selector__swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}
.theme-selector__selected {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
}
</style>
