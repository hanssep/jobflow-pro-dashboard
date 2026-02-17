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
            <!-- Presets -->
            <div class="theme-editor-panel__section">
                <div class="theme-editor-panel__section-label">Presets</div>
                <div class="theme-editor-panel__presets">
                    <v-btn
                        v-for="preset in presets"
                        :key="preset.name"
                        size="x-small"
                        variant="tonal"
                        @click="applyPreset(preset)"
                    >
                        {{ preset.name }}
                    </v-btn>
                </div>
            </div>

            <!-- Dark Mode Toggle -->
            <div class="theme-editor-panel__section theme-editor-panel__dark-toggle">
                <v-switch
                    v-model="isDarkMode"
                    label="Dark Mode"
                    density="compact"
                    hide-details
                    color="primary"
                    @update:model-value="onDarkModeToggle"
                />
            </div>

            <PropertySection
                :section="colorsSection"
                @field-change="onFieldChange"
            />
            <PropertySection
                :section="typographySection"
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
            saving: false,
            isDarkMode: false,
            lightSnapshot: null
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
        presets () {
            return [
                {
                    name: 'Light Modern',
                    colors: { primary: '#0094CE', bgPage: '#eeeeee', groupBg: '#ffffff', groupOutline: '#cccccc', surface: '#ffffff', text: '#111111', accent: '#ff6b99', secondary: '#26ff8c', success: '#a5d64c', warning: '#ff8e00', error: '#ff5252', info: '#ff53d0' },
                    sizes: { pagePadding: '12px', groupGap: '12px', groupBorderRadius: '4px', widgetGap: '12px', baseFontSize: '14px', fontFamily: 'System Default' }
                },
                {
                    name: 'Dark Mode',
                    colors: { primary: '#0094CE', bgPage: '#121212', groupBg: '#1e1e1e', groupOutline: '#333333', surface: '#1e1e1e', text: '#f0f0f0', accent: '#ff6b99', secondary: '#26ff8c', success: '#a5d64c', warning: '#ff8e00', error: '#ff5252', info: '#ff53d0' },
                    sizes: { pagePadding: '12px', groupGap: '12px', groupBorderRadius: '4px', widgetGap: '12px', baseFontSize: '14px', fontFamily: 'System Default' }
                },
                {
                    name: 'Minimal',
                    colors: { primary: '#607d8b', bgPage: '#fafafa', groupBg: '#ffffff', groupOutline: '#e0e0e0', surface: '#fafafa', text: '#333333', accent: '#90a4ae', secondary: '#b0bec5', success: '#81c784', warning: '#ffb74d', error: '#e57373', info: '#64b5f6' },
                    sizes: { pagePadding: '16px', groupGap: '16px', groupBorderRadius: '2px', widgetGap: '16px', baseFontSize: '13px', fontFamily: 'System Default' }
                },
                {
                    name: 'Corporate',
                    colors: { primary: '#1a56db', bgPage: '#f5f5f5', groupBg: '#ffffff', groupOutline: '#d0d0d0', surface: '#ffffff', text: '#1a1a1a', accent: '#3b82f6', secondary: '#64748b', success: '#22c55e', warning: '#eab308', error: '#ef4444', info: '#0ea5e9' },
                    sizes: { pagePadding: '12px', groupGap: '12px', groupBorderRadius: '4px', widgetGap: '12px', baseFontSize: '14px', fontFamily: 'System Default' }
                }
            ]
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
                    { key: 'colors.surface', label: 'Navigation Surface', type: 'color', value: colors.surface || '#ffffff' },
                    { key: 'colors.text', label: 'Text', type: 'color', value: colors.text || '#111111' },
                    { key: 'colors.accent', label: 'Accent', type: 'color', value: colors.accent || '#ff6b99' },
                    { key: 'colors.secondary', label: 'Secondary', type: 'color', value: colors.secondary || '#26ff8c' },
                    { key: 'colors.success', label: 'Success', type: 'color', value: colors.success || '#a5d64c' },
                    { key: 'colors.warning', label: 'Warning', type: 'color', value: colors.warning || '#ff8e00' },
                    { key: 'colors.error', label: 'Error', type: 'color', value: colors.error || '#ff5252' },
                    { key: 'colors.info', label: 'Info', type: 'color', value: colors.info || '#ff53d0' }
                ]
            }
        },
        typographySection () {
            const sizes = this.theme?.sizes || {}
            return {
                id: 'typography',
                label: 'Typography',
                fields: [
                    {
                        key: 'sizes.fontFamily',
                        label: 'Font Family',
                        type: 'select',
                        value: sizes.fontFamily || 'System Default',
                        options: ['System Default', 'Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Exo 2']
                    },
                    {
                        key: 'sizes.baseFontSize',
                        label: 'Base Font Size',
                        type: 'select',
                        value: sizes.baseFontSize || '14px',
                        options: ['12px', '13px', '14px', '15px', '16px']
                    }
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
            this.isDarkMode = false
            this.lightSnapshot = null
        },
        applyPreset (preset) {
            if (!this.themeId) return
            for (const [key, value] of Object.entries(preset.colors)) {
                this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                    themeId: this.themeId,
                    path: `colors.${key}`,
                    value
                })
            }
            for (const [key, value] of Object.entries(preset.sizes)) {
                this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                    themeId: this.themeId,
                    path: `sizes.${key}`,
                    value
                })
            }
            // Detect if applied preset is dark
            this.isDarkMode = preset.name === 'Dark Mode'
            this.lightSnapshot = null
        },
        onDarkModeToggle (dark) {
            if (!this.themeId || !this.theme) return
            if (dark) {
                // Save current light colors before switching
                this.lightSnapshot = JSON.parse(JSON.stringify(this.theme.colors))
                const darkColors = {
                    bgPage: '#121212',
                    groupBg: '#1e1e1e',
                    surface: '#1e1e1e',
                    text: '#f0f0f0',
                    groupOutline: '#333333'
                }
                for (const [key, value] of Object.entries(darkColors)) {
                    this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                        themeId: this.themeId,
                        path: `colors.${key}`,
                        value
                    })
                }
            } else if (this.lightSnapshot) {
                // Restore from light snapshot
                const restoreKeys = ['bgPage', 'groupBg', 'surface', 'text', 'groupOutline']
                for (const key of restoreKeys) {
                    if (this.lightSnapshot[key] !== undefined) {
                        this.$store.commit('ui/UPDATE_THEME_PROPERTY', {
                            themeId: this.themeId,
                            path: `colors.${key}`,
                            value: this.lightSnapshot[key]
                        })
                    }
                }
                this.lightSnapshot = null
            }
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
.theme-editor-panel__section {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.theme-editor-panel__section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 8px;
}
.theme-editor-panel__presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.theme-editor-panel__dark-toggle {
    padding-top: 8px;
    padding-bottom: 8px;
}
</style>
