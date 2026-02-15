<template>
    <div class="designer-palette">
        <div class="designer-palette__header">
            <v-icon size="18">mdi-puzzle-outline</v-icon>
            <span class="designer-palette__title">Widgets</span>
        </div>
        <PaletteSearch v-model="searchFilter" />
        <div class="designer-palette__content">
            <div v-if="loading" class="designer-palette__loading">
                <v-progress-circular indeterminate size="24" />
                <span>Loading widgets...</span>
            </div>
            <template v-else>
                <PaletteCategory
                    v-for="cat in filteredCategories"
                    :key="cat.id"
                    :category="cat"
                    :items="getFilteredItems(cat.id)"
                />
                <div v-if="filteredCategories.length === 0" class="designer-palette__empty">
                    No widgets match "{{ searchFilter }}"
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

import PaletteCategory from '../palette/PaletteCategory.vue'
import PaletteSearch from '../palette/PaletteSearch.vue'

export default {
    name: 'WidgetPalette',
    components: {
        PaletteCategory,
        PaletteSearch
    },
    setup () {
        const {
            widgetCategories,
            placeableTypes,
            widgetTypesLoading,
            getTypesByCategory
        } = useDesignerState()

        return {
            widgetCategories,
            placeableTypes,
            loading: widgetTypesLoading,
            getTypesByCategory
        }
    },
    data () {
        return {
            searchFilter: ''
        }
    },
    computed: {
        filteredCategories () {
            if (!this.widgetCategories) return []
            const sorted = [...this.widgetCategories].sort((a, b) => (a.order || 0) - (b.order || 0))
            if (!this.searchFilter) return sorted
            // Only show categories that have matching items
            return sorted.filter(cat => this.getFilteredItems(cat.id).length > 0)
        }
    },
    methods: {
        getFilteredItems (categoryId) {
            const items = this.getTypesByCategory(categoryId) || []
            if (!this.searchFilter) return items
            const filter = this.searchFilter.toLowerCase()
            return items.filter(item => {
                return item.label.toLowerCase().includes(filter) ||
                    item.type.toLowerCase().includes(filter)
            })
        }
    }
}
</script>

<style scoped>
.designer-palette {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}
.designer-palette__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-palette__title {
    flex: 1;
}
.designer-palette__content {
    flex: 1;
    overflow-y: auto;
}
.designer-palette__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 32px 16px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 0.8125rem;
}
.designer-palette__empty {
    padding: 24px 16px;
    text-align: center;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-size: 0.8125rem;
    font-style: italic;
}
</style>
