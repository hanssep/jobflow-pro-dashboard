<template>
    <v-app-bar flat density="compact" color="surface" class="studio-toolbar" :elevation="0">
        <!-- Pages mode: back + title + add page -->
        <template v-if="mode === 'pages'">
            <v-btn icon variant="text" title="Back to Dashboard" @click="$emit('go-back')">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="studio-toolbar__title studio-toolbar__brand">
                <img :src="fieryLogo" alt="Fiery" class="studio-toolbar__logo">
                <span>Fiery Lab <span class="studio-toolbar__brand-light">Dashboard Studio</span></span>
            </v-toolbar-title>
            <v-spacer />
            <v-btn
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                :loading="creating"
                rounded="sm"
                class="studio-toolbar__add-btn"
                @click="$emit('create-page')"
            >
                Add Page
            </v-btn>
        </template>

        <!-- Editing mode: breadcrumb + actions -->
        <template v-else>
            <v-btn icon variant="text" title="Back to Pages (Esc)" @click="$emit('back-to-pages')">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="studio-toolbar__title studio-toolbar__breadcrumb">
                <img :src="fieryLogo" alt="Fiery" class="studio-toolbar__logo studio-toolbar__logo--sm">
                <span class="studio-toolbar__breadcrumb-studio" @click="$emit('back-to-pages')">Studio</span>
                <v-icon size="14" class="mx-1" color="#999">mdi-chevron-right</v-icon>
                <span class="studio-toolbar__breadcrumb-page">{{ pageName }}</span>
            </v-toolbar-title>
            <v-spacer />

            <!-- Responsive breakpoint selector -->
            <div class="studio-toolbar__breakpoints">
                <v-btn-toggle
                    :model-value="previewBreakpoint"
                    density="compact"
                    mandatory
                    color="primary"
                    @update:model-value="$emit('update:preview-breakpoint', $event)"
                >
                    <v-btn
                        v-for="bp in breakpoints"
                        :key="bp.value"
                        :value="bp.value"
                        size="x-small"
                        variant="text"
                    >
                        <v-icon size="16">{{ bp.icon }}</v-icon>
                        <v-tooltip activator="parent" location="bottom">{{ bp.label }} ({{ bp.width || 'Fill' }})</v-tooltip>
                    </v-btn>
                </v-btn-toggle>
                <span class="studio-toolbar__bp-label text-caption text-medium-emphasis ml-1">
                    {{ activeBreakpointLabel }}
                </span>
            </div>

            <v-divider vertical class="mx-1" />

            <!-- Zoom controls -->
            <v-btn
                v-tooltip="'Zoom Out'"
                :disabled="zoom <= 0.25"
                variant="text"
                icon="mdi-minus"
                size="x-small"
                class="studio-toolbar__btn-sm"
                @click="$emit('zoom-out')"
            />
            <button
                class="studio-toolbar__zoom-label text-caption"
                title="Reset to 100% (Ctrl+1)"
                @click="$emit('zoom-reset')"
            >
                {{ Math.round(zoom * 100) }}%
            </button>
            <v-btn
                v-tooltip="'Zoom In'"
                :disabled="zoom >= 2"
                variant="text"
                icon="mdi-plus"
                size="x-small"
                class="studio-toolbar__btn-sm"
                @click="$emit('zoom-in')"
            />
            <v-btn
                v-tooltip="'Fit to View (Ctrl+0)'"
                variant="text"
                icon="mdi-fit-to-screen-outline"
                size="x-small"
                class="studio-toolbar__btn-sm"
                @click="$emit('zoom-fit')"
            />

            <v-divider vertical class="mx-1" />

            <!-- Grid overlay toggle -->
            <v-btn
                v-tooltip="'Toggle Grid Overlay'"
                :variant="gridOverlay ? 'flat' : 'text'"
                icon="mdi-grid"
                size="small"
                :color="gridOverlay ? 'primary' : undefined"
                class="studio-toolbar__btn"
                @click="$emit('toggle-grid-overlay')"
            />
            <!-- Toggle theme editor -->
            <v-btn
                v-tooltip="'Toggle Theme Editor'"
                :variant="themeEditorVisible ? 'flat' : 'text'"
                icon="mdi-palette"
                size="small"
                :color="themeEditorVisible ? 'primary' : undefined"
                class="studio-toolbar__btn"
                @click="$emit('toggle-theme-editor')"
            />
            <!-- Toggle property panel -->
            <v-btn
                v-tooltip="'Toggle Properties Panel'"
                :variant="propertiesVisible ? 'flat' : 'outlined'"
                icon="mdi-tune"
                size="small"
                :color="propertiesVisible ? 'primary' : undefined"
                class="studio-toolbar__btn"
                @click="$emit('toggle-properties')"
            />

            <v-divider vertical class="mx-1" />

            <!-- Undo -->
            <v-btn
                v-tooltip="'Undo (Ctrl+Z)'"
                :disabled="!canUndo || saving"
                variant="text"
                icon="mdi-undo"
                size="small"
                class="studio-toolbar__btn studio-toolbar__btn--undo"
                @click="$emit('undo')"
            />
            <!-- Redo -->
            <v-btn
                v-tooltip="'Redo (Ctrl+Shift+Z)'"
                :disabled="!canRedo || saving"
                variant="text"
                icon="mdi-redo"
                size="small"
                class="studio-toolbar__btn studio-toolbar__btn--undo"
                @click="$emit('redo')"
            />
            <!-- Discard -->
            <v-btn
                v-tooltip="'Discard All Changes'"
                :disabled="!dirty || saving"
                variant="text"
                icon="mdi-arrow-u-left-top"
                size="small"
                class="studio-toolbar__btn studio-toolbar__btn--discard"
                @click="$emit('discard')"
            />
            <!-- Save -->
            <v-btn
                v-tooltip="'Save Changes (Ctrl+S)'"
                :disabled="!dirty || saving"
                variant="flat"
                icon="mdi-content-save-outline"
                size="small"
                :loading="saving"
                class="studio-toolbar__btn studio-toolbar__btn--save"
                @click="$emit('save')"
            />
        </template>
    </v-app-bar>
</template>

<script>
import { useDesignerState } from '../designer/composables/useDesignerState.js'

// Fiery Lab logo — same SVG used by the package manager
const FIERY_LOGO = 'data:image/svg+xml,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="3" y="3" width="18" height="18" fill="url(#p0)"/><defs><pattern id="p0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#i0" transform="scale(0.00645161)"/></pattern><image id="i0" width="155" height="155" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/></defs></svg>')

const BREAKPOINTS = [
    { value: 'auto', label: 'Auto', icon: 'mdi-arrow-expand-horizontal', width: null },
    { value: 'desktop', label: 'Desktop', icon: 'mdi-monitor', width: 1920 },
    { value: 'laptop', label: 'Laptop', icon: 'mdi-laptop', width: 1280 },
    { value: 'tablet', label: 'Tablet', icon: 'mdi-tablet', width: 768 },
    { value: 'mobile', label: 'Mobile', icon: 'mdi-cellphone', width: 375 }
]

export default {
    name: 'StudioToolbar',
    props: {
        mode: { type: String, default: 'pages' },
        creating: { type: Boolean, default: false },
        pageName: { type: String, default: '' },
        dirty: { type: Boolean, default: false },
        saving: { type: Boolean, default: false },
        canUndo: { type: Boolean, default: false },
        canRedo: { type: Boolean, default: false },
        previewBreakpoint: { type: String, default: 'auto' },
        zoom: { type: Number, default: 1 },
        columnCount: { type: Number, default: 12 },
        gridOverlay: { type: Boolean, default: false }
    },
    emits: [
        'create-page', 'go-back', 'back-to-pages',
        'save', 'discard', 'undo', 'redo', 'toggle-properties',
        'toggle-theme-editor',
        'update:preview-breakpoint',
        'zoom-in', 'zoom-out', 'zoom-reset', 'zoom-fit',
        'toggle-grid-overlay'
    ],
    setup () {
        const { isPropertiesVisible, isThemeEditorVisible } = useDesignerState()
        return { propertiesVisible: isPropertiesVisible, themeEditorVisible: isThemeEditorVisible }
    },
    data () {
        return {
            fieryLogo: FIERY_LOGO
        }
    },
    computed: {
        breakpoints () {
            return BREAKPOINTS
        },
        activeBreakpointLabel () {
            const bp = BREAKPOINTS.find(b => b.value === this.previewBreakpoint)
            const cols = this.columnCount
            if (bp && bp.width) {
                return `${bp.width}px · ${cols} col`
            }
            return `${cols} col`
        }
    }
}
</script>

<style scoped>
.studio-toolbar {
    border-bottom: 1px solid #dee2e6;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%) !important;
    /* Isolate toolbar from Vuetify theme changes */
    --v-theme-on-surface: 0, 0, 0;
    --v-theme-on-background: 0, 0, 0;
    --v-theme-surface: 255, 255, 255;
    color: rgba(0, 0, 0, 0.87);
}
.studio-toolbar__title {
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #333;
}
.studio-toolbar__brand {
    display: flex;
    align-items: center;
    gap: 8px;
}
.studio-toolbar__logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
}
.studio-toolbar__logo--sm {
    width: 20px;
    height: 20px;
}
.studio-toolbar__brand-light {
    font-weight: 400;
}
.studio-toolbar__breadcrumb {
    display: flex;
    align-items: center;
    gap: 0;
}
.studio-toolbar__breadcrumb-studio {
    cursor: pointer;
    color: #666;
    font-weight: 500;
    font-size: 13px;
    transition: all 0.15s ease;
}
.studio-toolbar__breadcrumb-studio:hover {
    color: #8f0000;
    text-decoration: underline;
}
.studio-toolbar__breadcrumb-page {
    font-weight: 600;
    font-size: 13px;
    color: #333;
}
.studio-toolbar__breakpoints {
    display: flex;
    align-items: center;
    gap: 4px;
}
.studio-toolbar__bp-label {
    white-space: nowrap;
    min-width: 64px;
    font-family: 'Exo 2', sans-serif;
    font-size: 11px;
    color: #666;
}
.studio-toolbar__btn {
    border-radius: 4px;
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    margin: 0 2px;
    transition: all 0.15s ease;
}
.studio-toolbar__btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.studio-toolbar__btn:disabled {
    opacity: 0.4;
}
.studio-toolbar__btn-sm {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 4px;
    transition: all 0.15s ease;
}
.studio-toolbar__btn-sm:hover:not(:disabled) {
    background-color: #f5f5f5;
}
.studio-toolbar__zoom-label {
    background: none;
    border: 1px solid #ddd;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 42px;
    text-align: center;
    font-family: 'Exo 2', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #666;
    transition: all 0.15s ease;
}
.studio-toolbar__zoom-label:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
    color: #333;
}
.studio-toolbar__btn--undo {
    color: #666 !important;
}
.studio-toolbar__btn--undo:hover:not(:disabled) {
    color: #333 !important;
    background-color: #f5f5f5 !important;
}
.studio-toolbar__btn--discard {
    color: #8f0000 !important;
}
.studio-toolbar__btn--discard:hover:not(:disabled) {
    background-color: rgba(143, 0, 0, 0.08) !important;
}
.studio-toolbar__btn--save {
    background-color: #5a8f00 !important;
    color: white !important;
}
.studio-toolbar__btn--save:hover:not(:disabled) {
    background-color: #4a7a00 !important;
}
.studio-toolbar__btn--save:disabled {
    background-color: #e5e7eb !important;
    color: #999 !important;
    opacity: 1;
}
.studio-toolbar__add-btn {
    background-color: #8f0000 !important;
    color: white !important;
    font-family: 'Exo 2', sans-serif;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.02em;
    transition: all 0.15s ease;
}
.studio-toolbar__add-btn:hover {
    background-color: #6e0000 !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
