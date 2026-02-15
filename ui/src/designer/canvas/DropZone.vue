<template>
    <div
        class="designer-drop-zone"
        :class="{ 'designer-drop-zone--active': isActive, 'designer-drop-zone--hover': isHover }"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >
        <div class="designer-drop-zone__indicator">
            <v-icon v-if="isHover" size="16">mdi-plus</v-icon>
        </div>
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

export default {
    name: 'DropZone',
    props: {
        groupId: { type: String, required: true },
        index: { type: Number, required: true }
    },
    emits: ['widget-drop'],
    setup () {
        const { isDragging } = useDesignerState()
        return { isDragging }
    },
    data () {
        return {
            isHover: false
        }
    },
    computed: {
        isActive () {
            return this.isDragging
        }
    },
    methods: {
        onDragOver (event) {
            event.dataTransfer.dropEffect = 'copy'
            this.isHover = true
        },
        onDragLeave () {
            this.isHover = false
        },
        onDrop (event) {
            this.isHover = false
            try {
                const data = JSON.parse(event.dataTransfer.getData('application/x-designer-widget'))
                if (data && data.source === 'palette' && data.widgetType) {
                    this.$emit('widget-drop', {
                        widgetType: data.widgetType,
                        groupId: this.groupId,
                        index: this.index
                    })
                }
            } catch (e) {
                // Not a valid designer drag
            }
        }
    }
}
</script>

<style scoped>
.designer-drop-zone {
    height: 0;
    transition: height 0.15s ease, opacity 0.15s ease;
    overflow: hidden;
    opacity: 0;
}
.designer-drop-zone--active {
    height: 32px;
    opacity: 1;
}
.designer-drop-zone--hover {
    height: 48px;
}
.designer-drop-zone__indicator {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(var(--v-theme-primary), 0.4);
    border-radius: 4px;
    margin: 2px 4px;
    background-color: rgba(var(--v-theme-primary), 0.04);
    transition: all 0.15s ease;
}
.designer-drop-zone--hover .designer-drop-zone__indicator {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
