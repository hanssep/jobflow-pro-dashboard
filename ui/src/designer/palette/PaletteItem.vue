<template>
    <div
        class="designer-palette-item"
        draggable="true"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
    >
        <v-icon size="20" class="designer-palette-item__icon">{{ widgetType.icon || 'mdi-puzzle-outline' }}</v-icon>
        <span class="designer-palette-item__label">{{ widgetType.label }}</span>
        <v-chip v-if="!widgetType.isCore" size="x-small" variant="outlined" color="grey" class="designer-palette-item__badge">3rd</v-chip>
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

export default {
    name: 'PaletteItem',
    props: {
        widgetType: {
            type: Object,
            required: true
        }
    },
    setup () {
        const { startDrag, endDrag } = useDesignerState()
        return { startDrag, endDrag }
    },
    methods: {
        onDragStart (event) {
            event.dataTransfer.effectAllowed = 'copy'
            event.dataTransfer.setData('application/x-designer-widget', JSON.stringify({
                source: 'palette',
                widgetType: this.widgetType.type
            }))
            this.startDrag('palette', this.widgetType.type)
        },
        onDragEnd () {
            this.endDrag()
        }
    }
}
</script>

<style scoped>
.designer-palette-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: grab;
    border-radius: 4px;
    transition: background-color 0.15s;
    user-select: none;
}
.designer-palette-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
}
.designer-palette-item:active {
    cursor: grabbing;
    background-color: rgba(var(--v-theme-primary), 0.12);
}
.designer-palette-item__icon {
    flex-shrink: 0;
    color: rgba(var(--v-theme-on-surface), 0.7);
}
.designer-palette-item__label {
    flex: 1;
    font-size: 0.8125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.designer-palette-item__badge {
    flex-shrink: 0;
}
</style>
