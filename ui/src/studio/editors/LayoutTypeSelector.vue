<template>
    <div class="layout-type-selector">
        <div
            v-for="opt in options"
            :key="opt.value"
            class="layout-type-selector__card"
            :class="{ 'layout-type-selector__card--active': modelValue === opt.value }"
            @click="$emit('update:modelValue', opt.value)"
        >
            <v-icon size="28" :color="modelValue === opt.value ? '#5a8f00' : '#999'">{{ opt.icon }}</v-icon>
            <span class="layout-type-selector__label">{{ opt.label }}</span>
            <span class="layout-type-selector__desc">{{ opt.desc }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LayoutTypeSelector',
    props: {
        modelValue: { type: String, default: 'grid' }
    },
    emits: ['update:modelValue'],
    data () {
        return {
            options: [
                { value: 'grid', label: 'Grid', desc: 'Responsive columns', icon: 'mdi-view-grid-outline' },
                { value: 'flex', label: 'Fixed', desc: 'Fixed positioning', icon: 'mdi-view-dashboard-outline' },
                { value: 'tabs', label: 'Tabs', desc: 'Groups as tabs', icon: 'mdi-tab' },
                { value: 'notebook', label: 'Notebook', desc: 'Groups as pages', icon: 'mdi-notebook-outline' }
            ]
        }
    }
}
</script>

<style scoped>
.layout-type-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
.layout-type-selector__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #fafafa;
}
.layout-type-selector__card:hover {
    border-color: #999;
    background: #f5f5f5;
}
.layout-type-selector__card--active {
    border-color: #5a8f00;
    background: rgba(90, 143, 0, 0.04);
}
.layout-type-selector__label {
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #333;
}
.layout-type-selector__desc {
    font-family: 'Exo 2', sans-serif;
    font-size: 11px;
    color: #888;
}
</style>
