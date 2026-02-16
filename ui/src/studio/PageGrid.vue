<template>
    <div v-if="sortedPages.length" class="studio-page-grid">
        <PageCard
            v-for="page in sortedPages"
            :key="page.id"
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
    emits: ['open-page', 'rename-page', 'delete-page', 'start-rename'],
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
    }
}
</script>

<style scoped>
.studio-page-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    padding: 24px;
}
.studio-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 60px 20px;
}
.studio-empty-state .v-icon {
    opacity: 0.5;
}
</style>
