<template>
    <div v-if="sortedPages.length" class="studio-page-grid">
        <div
            v-for="(page, index) in sortedPages"
            :key="page.id"
            class="studio-page-grid__item"
            :class="{
                'studio-page-grid__item--drag-over': dragOverIndex === index,
                'studio-page-grid__item--dragging': dragIndex === index
            }"
            :draggable="page.id !== creatingPageId"
            @dragstart="onDragStart($event, index)"
            @dragover.prevent="onDragOver($event, index)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop($event, index)"
            @dragend="onDragEnd"
        >
            <PageCard
                :page="page"
                :groups="allGroups"
                :widgets="widgets"
                :is-creating="page.id === creatingPageId"
                @open="(id) => $emit('open-page', id)"
                @rename="(id, name) => $emit('rename-page', id, name)"
                @delete="(id) => $emit('delete-page', id)"
                @start-rename="(id) => $emit('start-rename', id)"
            />
        </div>
    </div>
    <div v-else class="studio-empty-state">
        <v-icon size="80" color="grey-lighten-1">mdi-view-dashboard-outline</v-icon>
        <h3 class="text-h6 text-medium-emphasis mt-4">No pages yet</h3>
        <p class="text-body-2 text-medium-emphasis mt-1">Click "Add Page" to create your first dashboard page</p>
    </div>
</template>

<script>
import PageCard from './PageCard.vue'

export default {
    name: 'PageGrid',
    components: { PageCard },
    props: {
        pages: { type: Object, default: () => ({}) },
        groups: { type: Object, default: () => ({}) },
        widgets: { type: Object, default: () => ({}) },
        creatingPageId: { type: String, default: null },
        dashboardId: { type: String, default: '' }
    },
    emits: ['open-page', 'rename-page', 'delete-page', 'start-rename', 'reorder-pages'],
    data () {
        return {
            dragIndex: null,
            dragOverIndex: null
        }
    },
    computed: {
        sortedPages () {
            if (!this.pages) return []
            return Object.values(this.pages)
                .filter(p => p.ui === this.dashboardId)
                .sort((a, b) => (a.order || 999) - (b.order || 999))
        },
        allGroups () {
            if (!this.groups) return []
            return Object.values(this.groups)
        }
    },
    methods: {
        onDragStart (e, index) {
            this.dragIndex = index
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', String(index))
        },
        onDragOver (e, index) {
            if (this.dragIndex === null || this.dragIndex === index) return
            e.dataTransfer.dropEffect = 'move'
            this.dragOverIndex = index
        },
        onDragLeave () {
            this.dragOverIndex = null
        },
        onDrop (e, dropIndex) {
            this.dragOverIndex = null
            if (this.dragIndex === null || this.dragIndex === dropIndex) return
            const pages = [...this.sortedPages]
            const [moved] = pages.splice(this.dragIndex, 1)
            pages.splice(dropIndex, 0, moved)
            this.$emit('reorder-pages', pages.map(p => p.id))
            this.dragIndex = null
        },
        onDragEnd () {
            this.dragIndex = null
            this.dragOverIndex = null
        }
    }
}
</script>

<style scoped>
.studio-page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    padding: 24px;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.studio-page-grid__item {
    transition: transform 0.2s ease, opacity 0.2s ease;
    border-radius: 8px;
}
.studio-page-grid__item--dragging {
    opacity: 0.4;
}
.studio-page-grid__item--drag-over {
    outline: 2px dashed #8f0000;
    outline-offset: 4px;
    border-radius: 8px;
}
.studio-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 60px 20px;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.studio-empty-state .v-icon {
    opacity: 0.4;
}
.studio-empty-state h3 {
    color: #333;
    font-weight: 600;
}
.studio-empty-state p {
    color: #666;
}
</style>
