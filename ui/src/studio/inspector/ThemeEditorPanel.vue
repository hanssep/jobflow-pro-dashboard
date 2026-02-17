<template>
    <div class="theme-editor-panel">
        <div class="theme-editor-panel__header">
            <v-icon size="18">mdi-palette</v-icon>
            <span class="theme-editor-panel__title">Theme</span>
            <v-spacer />
            <v-btn
                v-tooltip="'Discard Changes'"
                :disabled="!hasChanges"
                variant="text"
                icon="mdi-undo"
                size="x-small"
                @click="discardChanges"
            />
            <v-btn
                v-tooltip="'Apply Changes'"
                :disabled="!hasChanges"
                :loading="saving"
                variant="flat"
                icon="mdi-check"
                size="x-small"
                color="primary"
                @click="applyChanges"
            />
        </div>

        <div v-if="!theme" class="theme-editor-panel__empty">
            <v-icon size="48" color="grey-lighten-1">mdi-palette-outline</v-icon>
            <span>No theme available</span>
        </div>

        <div v-else class="theme-editor-panel__content">
            <PropertySection
                :section="colorsSection"
                @field-change="onFieldChange"
            />
            <PropertySection
                :section="spacingSection"
                @field-change="onFieldChange"
            />
            <PropertySection
                :section="densitySection"
                @field-change="onFieldChange"
            />
        </div>
    </div>
</template>

<script>
import PropertySection from '../../designer/properties/PropertySection.vue'
import StudioApi from '../composables/useStudioApi.js'

export default {
    name: 'ThemeEditorPanel',
    components: { PropertySection },
    props: {
        themeId: { type: String, default: null },
        dashboardId: { type: String, default: '' },
        editorPath: { type: String, default: '' }
    },
    data () {
        return {
            snapshot: null,
            saving: false
        }
    },
    computed: {
        theme () {
            if (!this.themeId) return null
            return this.$store.state.ui.themes?.[this.themeId] || null
        },
        hasChanges () {
            if (!this.snapshot || !this.theme) return false
            return JSON.stringify(this.snapshot) !== JSON.stringify({
                colors: this.theme.colors,
                sizes: this.theme.sizes
            })
        },
        colorsSection () {
            const colors = this.theme?.colors || {}
            return {
                id: 'colors',
                label: 'Colors',
                fields: [
                    { key: 'colors.primary', label: 'Primary', type: 'color', value: colors.primary || '#0094CE' },
                    { key: 'colors.bgPage', label: 'Page Background', type: 'color', value: colors.bgPage || '#eeeeee' },
                    { key: 'colors.groupBg', label: 'Group Background', type: 'color', value: colors.groupBg || '#ffffff' },
                    { key: 'colors.groupOutline', label: 'Group Outline', type: 'color', value: colors.groupOutline || '#cccccc' },
                    { key: 'colors.surface', label: 'Navigation Surface', type: 'color', value: colors.surface || '#ffffff' }
                ]
            }
        },
        spacingSection () {
            const sizes = this.theme?.sizes || {}
            return {
                id: 'spacing',
                label: 'Spacing',
                fields: [
                    { key: 'sizes.pagePadding', label: 'Page Padding', type: 'text', value: sizes.pagePadding || '12px' },
                    { key: 'sizes.groupGap', label: 'Group Gap', type: 'text', value: sizes.groupGap || '12px' },
                    { key: 'sizes.groupBorderRadius', label: 'Group Border Radius', type: 'text', value: sizes.groupBorderRadius || '4px' },
                    { key: 'sizes.widgetGap', label: 'Widget Gap', type: 'text', value: sizes.widgetGap || '12px' }
                ]
            }
        },
        densitySection () {
            const sizes = this.theme?.sizes || {}
            return {
                id: 'density',
                label: 'Density',
                fields: [
                    {
                        key: 'sizes.density',
                        label: 'Density',
                        type: 'toggle-group',
                        value: sizes.density || 'default',
                        options: [
                            { label: 'Default', value: 'default' },
                            { label: 'Comfortable', value: 'comfortable' },
                            { label: 'Compact', value: 'compact' }
                        ]
                    }
                ]
            }
        }
    },
    watch: {
        themeId: {
            immediate: true,
            handler () {
                this.takeSnapshot()
            }
        }
    },
    methods: {
        takeSnapshot () {
            if (!this.theme) {
                this.snapshot = null
                return
            }
            this.snapshot = JSON.parse(JSON.stringify({
                colors: this.theme.colors || {},
                sizes: this.theme.sizes || {}
            }))
        },
        onFieldChange ({ key, value }) {
            if (!this.themeId) return
            this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                themeId: this.themeId,
                path: key,
                value
            })
        },
        async applyChanges () {
            if (!this.themeId || !this.hasChanges) return
            this.saving = true
            try {
                const updates = {}
                // Build partial updates: only changed sub-objects
                if (JSON.stringify(this.theme.colors) !== JSON.stringify(this.snapshot.colors)) {
                    updates.colors = { ...this.theme.colors }
                }
                if (JSON.stringify(this.theme.sizes) !== JSON.stringify(this.snapshot.sizes)) {
                    updates.sizes = { ...this.theme.sizes }
                }
                await StudioApi.updateTheme({
                    dashboard: this.dashboardId,
                    themeId: this.themeId,
                    editorPath: this.editorPath,
                    updates
                })
                this.takeSnapshot()
            } catch (err) {
                console.error('[ThemeEditor] Apply failed:', err.response?.data || err.message)
            } finally {
                this.saving = false
            }
        },
        discardChanges () {
            if (!this.snapshot || !this.themeId) return
            // Restore each property from the snapshot
            const restore = (obj, prefix) => {
                for (const key of Object.keys(obj)) {
                    this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                        themeId: this.themeId,
                        path: `${prefix}.${key}`,
                        value: obj[key]
                    })
                }
            }
            if (this.snapshot.colors) restore(this.snapshot.colors, 'colors')
            if (this.snapshot.sizes) restore(this.snapshot.sizes, 'sizes')
        }
    }
}
</script>

<style scoped>
.theme-editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.theme-editor-panel__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.theme-editor-panel__title {
    flex: 1;
}
.theme-editor-panel__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-size: 0.8125rem;
}
.theme-editor-panel__content {
    flex: 1;
    overflow-y: auto;
}
</style>
