<template>
    <div class="designer-toolbar">
        <div class="designer-toolbar__left">
            <v-btn
                v-tooltip="'Toggle Widget Palette'"
                :variant="isPaletteVisible ? 'flat' : 'outlined'"
                icon="mdi-puzzle-outline"
                size="small"
                :color="isPaletteVisible ? 'primary' : undefined"
                @click="togglePalette"
            />
            <v-btn
                v-tooltip="'Toggle Property Editor'"
                :variant="isPropertiesVisible ? 'flat' : 'outlined'"
                icon="mdi-tune"
                size="small"
                :color="isPropertiesVisible ? 'primary' : undefined"
                @click="toggleProperties"
            />
        </div>
        <div class="designer-toolbar__center">
            <v-chip color="warning" variant="tonal" size="small" prepend-icon="mdi-pencil">
                Designer Mode
            </v-chip>
        </div>
        <div class="designer-toolbar__right">
            <v-btn
                v-tooltip="'Undo (Ctrl+Z)'"
                :disabled="!canUndo || saveBusy"
                variant="outlined"
                icon="mdi-undo"
                size="small"
                color="orange"
                @click="$emit('undo')"
            />
            <v-btn
                v-tooltip="'Discard All Changes'"
                :disabled="!dirty || saveBusy"
                variant="outlined"
                icon="mdi-arrow-u-left-top"
                size="small"
                color="blue"
                @click="$emit('discard')"
            />
            <v-btn
                v-tooltip="'Save Changes (Ctrl+S)'"
                :disabled="!dirty || saveBusy"
                variant="outlined"
                icon="mdi-content-save-outline"
                size="small"
                color="green"
                :loading="saveBusy"
                @click="$emit('save')"
            />
            <v-btn
                v-tooltip="'Leave Edit Mode (Esc)'"
                :disabled="saveBusy"
                variant="outlined"
                icon="mdi-close"
                size="small"
                color="red-darken-1"
                @click="$emit('cancel')"
            />
        </div>
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

export default {
    name: 'DesignerToolbar',
    props: {
        dirty: { type: Boolean, default: false },
        saveBusy: { type: Boolean, default: false },
        canUndo: { type: Boolean, default: false }
    },
    emits: ['cancel', 'discard', 'save', 'undo'],
    setup () {
        const { isPaletteVisible, isPropertiesVisible, togglePalette, toggleProperties } = useDesignerState()
        return { isPaletteVisible, isPropertiesVisible, togglePalette, toggleProperties }
    }
}
</script>

<style scoped>
.designer-toolbar {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background-color: rgb(var(--v-theme-surface));
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    gap: 8px;
    min-height: 44px;
    z-index: 10;
}
.designer-toolbar__left,
.designer-toolbar__right {
    display: flex;
    align-items: center;
    gap: 4px;
}
.designer-toolbar__center {
    flex: 1;
    display: flex;
    justify-content: center;
}
.designer-toolbar__left .v-btn,
.designer-toolbar__right .v-btn {
    border-radius: 2rem;
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    min-height: 2rem;
}
.designer-toolbar__right button:disabled {
    filter: grayscale(1);
}
</style>
