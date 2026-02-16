<template>
    <v-card
        class="studio-page-card"
        :class="{ 'studio-page-card--creating': isCreating }"
        :elevation="0"
        rounded="0"
        @click="!isCreating && $emit('open', page.id)"
    >
        <!-- SVG Thumbnail -->
        <div class="studio-page-card__thumbnail">
            <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" class="studio-page-card__svg">
                <!-- Background -->
                <rect width="280" height="160" rx="4" fill="#f5f5f5" />
                <!-- Groups and widgets -->
                <template v-for="(g, gi) in pageGroups" :key="g.id">
                    <rect
                        :x="groupX(gi)"
                        :y="groupY(gi)"
                        :width="groupWidth(g)"
                        :height="groupHeight(g, gi)"
                        rx="3"
                        fill="#e3f2fd"
                        stroke="#90caf9"
                        stroke-width="1"
                    />
                    <!-- Widgets inside group -->
                    <rect
                        v-for="(w, wi) in groupWidgets(g.id)"
                        :key="w.id"
                        :x="widgetX(gi, wi, w)"
                        :y="widgetY(gi, wi)"
                        :width="widgetWidth(w, g)"
                        :height="12"
                        rx="2"
                        :fill="widgetColor(w.type)"
                    />
                </template>
                <!-- Empty state -->
                <text v-if="!pageGroups.length" x="140" y="85" text-anchor="middle" fill="#bdbdbd" font-size="14">
                    Empty Page
                </text>
            </svg>
        </div>

        <!-- Card Content -->
        <v-card-text class="studio-page-card__content">
            <PageCardInlineRename
                v-if="isCreating"
                :current-name="page.name"
                @rename="(name) => $emit('rename', page.id, name)"
                @cancel="$emit('rename', page.id, page.name)"
            />
            <template v-else>
                <div class="studio-page-card__name">
                    <v-icon size="small" class="mr-1">mdi-file-document-outline</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">{{ page.name }}</span>
                </div>
                <div class="studio-page-card__meta text-caption text-medium-emphasis">
                    {{ page.path }} &middot; {{ widgetCount }} widget{{ widgetCount !== 1 ? 's' : '' }}
                </div>
            </template>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions v-if="!isCreating" class="studio-page-card__actions">
            <v-spacer />
            <v-btn icon size="small" variant="text" title="Rename" @click.stop="$emit('start-rename', page.id)">
                <v-icon size="small">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" color="error" title="Delete" @click.stop="$emit('delete', page.id)">
                <v-icon size="small">mdi-delete</v-icon>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import PageCardInlineRename from './PageCardInlineRename.vue'

export default {
    name: 'PageCard',
    components: { PageCardInlineRename },
    props: {
        page: { type: Object, required: true },
        groups: { type: Array, default: () => [] },
        widgets: { type: Object, default: () => ({}) },
        isCreating: { type: Boolean, default: false }
    },
    emits: ['open', 'rename', 'delete', 'start-rename'],
    computed: {
        pageGroups () {
            return this.groups
                .filter(g => g.page === this.page.id)
                .sort((a, b) => (a.order || 999) - (b.order || 999))
        },
        widgetCount () {
            if (!this.widgets) return 0
            const groupIds = new Set(this.pageGroups.map(g => g.id))
            return Object.values(this.widgets).filter(w => groupIds.has(w.props?.group)).length
        }
    },
    methods: {
        groupWidgets (groupId) {
            if (!this.widgets) return []
            return Object.values(this.widgets)
                .filter(w => w.props?.group === groupId)
                .sort((a, b) => (a.layout?.order || 999) - (b.layout?.order || 999))
                .slice(0, 6) // limit for thumbnail
        },
        groupX (gi) {
            // Layout groups in rows of 2
            const col = gi % 2
            return 8 + col * 136
        },
        groupY (gi) {
            const row = Math.floor(gi / 2)
            return 8 + row * 50
        },
        groupWidth (g) {
            const cols = Math.min(g.width || 6, 12)
            return Math.max((cols / 12) * 264, 40)
        },
        groupHeight (g, gi) {
            const widgets = this.groupWidgets(g.id)
            return Math.max(20 + widgets.length * 14, 30)
        },
        widgetX (gi, wi, w) {
            return this.groupX(gi) + 4 + (wi % 3) * 42
        },
        widgetY (gi, wi) {
            return this.groupY(gi) + 14 + Math.floor(wi / 3) * 14
        },
        widgetWidth (w, g) {
            const wWidth = w.layout?.width || w.props?.width || 3
            const gWidth = g.width || 6
            return Math.max((wWidth / gWidth) * 120, 16)
        },
        widgetColor (type) {
            const colors = {
                'ui-button': '#42a5f5',
                'ui-text': '#66bb6a',
                'ui-slider': '#ab47bc',
                'ui-switch': '#ef5350',
                'ui-chart': '#ffa726',
                'ui-gauge': '#26c6da',
                'ui-template': '#78909c',
                'ui-form': '#5c6bc0',
                'ui-table': '#8d6e63'
            }
            return colors[type] || '#bdbdbd'
        }
    }
}
</script>

<style scoped>
.studio-page-card {
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
}
.studio-page-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgb(var(--v-theme-primary));
}
.studio-page-card--creating {
    cursor: default;
    border: 2px solid rgb(var(--v-theme-primary));
}
.studio-page-card__thumbnail {
    background: #fafafa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.studio-page-card__svg {
    width: 100%;
    height: auto;
    display: block;
}
.studio-page-card__content {
    padding: 12px 16px 8px;
}
.studio-page-card__name {
    display: flex;
    align-items: center;
}
.studio-page-card__name span {
    font-size: 15px;
    font-weight: 600;
}
.studio-page-card__meta {
    margin-top: 4px;
    font-size: 12px;
}
.studio-page-card__actions {
    padding: 4px 8px;
    min-height: unset;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
