<template>
    <div class="designer-palette-category">
        <div class="designer-palette-category__header" @click="collapsed = !collapsed">
            <v-icon size="18" class="designer-palette-category__chevron" :class="{ 'rotated': !collapsed }">
                mdi-chevron-right
            </v-icon>
            <v-icon size="18" class="designer-palette-category__icon">{{ category.icon || 'mdi-puzzle' }}</v-icon>
            <span class="designer-palette-category__label">{{ category.label }}</span>
            <v-chip size="x-small" variant="tonal" class="designer-palette-category__count">{{ items.length }}</v-chip>
        </div>
        <div v-show="!collapsed" class="designer-palette-category__items">
            <PaletteItem
                v-for="item in items"
                :key="item.type"
                :widget-type="item"
            />
        </div>
    </div>
</template>

<script>
import PaletteItem from './PaletteItem.vue'

export default {
    name: 'PaletteCategory',
    components: { PaletteItem },
    props: {
        category: {
            type: Object,
            required: true
        },
        items: {
            type: Array,
            default: () => []
        },
        initialCollapsed: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            collapsed: this.initialCollapsed
        }
    }
}
</script>

<style scoped>
.designer-palette-category__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.87);
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-palette-category__header:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
}
.designer-palette-category__chevron {
    transition: transform 0.2s;
}
.designer-palette-category__chevron.rotated {
    transform: rotate(90deg);
}
.designer-palette-category__icon {
    color: rgba(var(--v-theme-on-surface), 0.6);
}
.designer-palette-category__label {
    flex: 1;
}
.designer-palette-category__count {
    flex-shrink: 0;
}
.designer-palette-category__items {
    padding: 4px 0;
}
</style>
