<template>
    <div
        class="designer-group"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >
        <template v-for="(w, $index) in widgets" :key="w.id">
            <DropZone
                :group-id="groupId"
                :index="$index"
                @widget-drop="onWidgetDrop"
            />
            <DesignerWidget
                :widget="w"
                @widget-selected="$emit('widget-selected', $event)"
                @widget-delete="$emit('widget-delete', $event)"
            >
                <slot name="widget" :widget="w" :index="$index" />
            </DesignerWidget>
        </template>
        <!-- Drop zone at end -->
        <DropZone
            :group-id="groupId"
            :index="widgets ? widgets.length : 0"
            @widget-drop="onWidgetDrop"
        />
    </div>
</template>

<script>
import DesignerWidget from './DesignerWidget.vue'
import DropZone from './DropZone.vue'

export default {
    name: 'DesignerGroup',
    components: { DesignerWidget, DropZone },
    props: {
        groupId: { type: String, required: true },
        widgets: { type: Array, default: () => [] }
    },
    emits: ['widget-drop', 'widget-selected', 'widget-delete'],
    data () {
        return {
            isDragOver: false
        }
    },
    methods: {
        onDragOver (event) {
            event.dataTransfer.dropEffect = 'copy'
            this.isDragOver = true
        },
        onDragLeave () {
            this.isDragOver = false
        },
        onDrop (event) {
            this.isDragOver = false
            try {
                const data = JSON.parse(event.dataTransfer.getData('application/x-designer-widget'))
                if (data && data.source === 'palette') {
                    this.$emit('widget-drop', {
                        widgetType: data.widgetType,
                        groupId: this.groupId,
                        index: this.widgets ? this.widgets.length : 0
                    })
                }
            } catch (e) {
                // Not a valid designer drag
            }
        },
        onWidgetDrop (payload) {
            this.$emit('widget-drop', payload)
        }
    }
}
</script>

<style scoped>
.designer-group {
    position: relative;
}
</style>
