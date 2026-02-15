<template>
    <div class="designer-shell">
        <DesignerToolbar
            :dirty="dirty"
            :save-busy="saveBusy"
            :can-undo="canUndo"
            @cancel="$emit('cancel')"
            @discard="$emit('discard')"
            @save="$emit('save')"
            @undo="$emit('undo')"
        />
        <div class="designer-shell__body">
            <transition name="slide-left">
                <div v-if="isPaletteVisible" class="designer-shell__panel designer-shell__palette">
                    <WidgetPalette />
                </div>
            </transition>
            <CanvasPanel class="designer-shell__canvas">
                <slot />
            </CanvasPanel>
            <transition name="slide-right">
                <div v-if="isPropertiesVisible" class="designer-shell__panel designer-shell__properties">
                    <PropertyEditor />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { useDesignerState } from './composables/useDesignerState.js'
import { fetchWidgetTypes } from './services/WidgetTypeService.js'

import CanvasPanel from './panels/CanvasPanel.vue'
import PropertyEditor from './panels/PropertyEditor.vue'
import WidgetPalette from './panels/WidgetPalette.vue'
import DesignerToolbar from './toolbar/DesignerToolbar.vue'

export default {
    name: 'DesignerShell',
    components: {
        CanvasPanel,
        DesignerToolbar,
        PropertyEditor,
        WidgetPalette
    },
    props: {
        dirty: { type: Boolean, default: false },
        saveBusy: { type: Boolean, default: false },
        canUndo: { type: Boolean, default: false },
        dashboardId: { type: String, default: '' },
        editorPath: { type: String, default: '' }
    },
    emits: ['cancel', 'discard', 'save', 'undo'],
    setup () {
        const { isPaletteVisible, isPropertiesVisible, enable, disable } = useDesignerState()
        return { isPaletteVisible, isPropertiesVisible, enable, disable }
    },
    mounted () {
        this.enable()
        if (this.dashboardId) {
            fetchWidgetTypes(this.$store, this.dashboardId, this.editorPath).catch(err => {
                console.error('[DesignerShell] Failed to load widget types:', err)
            })
        }
    },
    beforeUnmount () {
        this.disable()
    }
}
</script>

<style scoped>
.designer-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
}
.designer-shell__body {
    display: flex;
    flex: 1;
    overflow: hidden;
}
.designer-shell__panel {
    overflow-y: auto;
    background-color: rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-shell__palette {
    width: 260px;
    min-width: 260px;
    border-right-width: 1px;
    border-right-style: solid;
}
.designer-shell__canvas {
    flex: 1;
    min-width: 0;
    overflow: auto;
}
.designer-shell__properties {
    width: 300px;
    min-width: 300px;
    border-left-width: 1px;
    border-left-style: solid;
}

/* Panel slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.2s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
    transform: translateX(-100%);
    opacity: 0;
    width: 0;
    min-width: 0;
}
.slide-right-enter-from,
.slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
    width: 0;
    min-width: 0;
}
</style>
