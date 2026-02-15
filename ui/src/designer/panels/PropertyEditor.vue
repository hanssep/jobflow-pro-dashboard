<template>
    <div class="designer-property-editor">
        <div class="designer-property-editor__header">
            <v-icon size="18">mdi-tune</v-icon>
            <span class="designer-property-editor__title">Properties</span>
        </div>
        <div v-if="!selection" class="designer-property-editor__empty">
            <v-icon size="48" color="grey-lighten-1">mdi-cursor-default-click-outline</v-icon>
            <span>Select a widget to edit its properties</span>
        </div>
        <template v-else>
            <div class="designer-property-editor__widget-info">
                <v-icon size="20">{{ typeIcon }}</v-icon>
                <div class="designer-property-editor__widget-meta">
                    <span class="designer-property-editor__widget-type">{{ typeLabel }}</span>
                    <span class="designer-property-editor__widget-id">{{ selection.id }}</span>
                </div>
            </div>
            <div class="designer-property-editor__content">
                <!-- Size field (always shown for widgets with width/height) -->
                <div v-if="hasSize" class="designer-property-editor__size">
                    <SizeField
                        :width="currentWidth"
                        :height="currentHeight"
                        @update:width="onSizeChange('width', $event)"
                        @update:height="onSizeChange('height', $event)"
                    />
                </div>
                <PropertySection
                    v-for="section in schema.sections"
                    :key="section.id"
                    :section="section"
                    @field-change="onFieldChange"
                />
            </div>
        </template>
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'
import { getEditableProperties } from '../services/WidgetSchemaService.js'

import PropertySection from '../properties/PropertySection.vue'
import SizeField from '../properties/fields/SizeField.vue'

export default {
    name: 'PropertyEditor',
    components: { PropertySection, SizeField },
    setup () {
        const { selection, getTypeInfo } = useDesignerState()
        return { selection, getTypeInfo }
    },
    computed: {
        selectedWidget () {
            if (!this.selection) return null
            return this.$store.state.ui.widgets[this.selection.id]
        },
        typeInfo () {
            if (!this.selection) return null
            return this.getTypeInfo(this.selection.widgetType)
        },
        typeLabel () {
            return this.typeInfo?.label || this.selection?.widgetType || 'Widget'
        },
        typeIcon () {
            return this.typeInfo?.icon || 'mdi-puzzle-outline'
        },
        schema () {
            if (!this.selection || !this.selectedWidget) {
                return { sections: [] }
            }
            return getEditableProperties(this.$store, this.selection.widgetType, this.selectedWidget.props)
        },
        hasSize () {
            return this.selectedWidget?.props?.width !== undefined || this.selectedWidget?.props?.height !== undefined
        },
        currentWidth () {
            return parseInt(this.selectedWidget?.props?.width) || 1
        },
        currentHeight () {
            return parseInt(this.selectedWidget?.props?.height) || 1
        }
    },
    methods: {
        onFieldChange ({ key, value }) {
            if (!this.selection) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('wysiwyg/updateWidgetProperty', {
                id: this.selection.id,
                key,
                value
            })
        },
        onSizeChange (dimension, value) {
            if (!this.selection) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('wysiwyg/updateWidgetProperty', {
                id: this.selection.id,
                key: dimension,
                value
            })
        }
    }
}
</script>

<style scoped>
.designer-property-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}
.designer-property-editor__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-property-editor__title {
    flex: 1;
}
.designer-property-editor__empty {
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
.designer-property-editor__widget-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background-color: rgba(var(--v-theme-primary), 0.06);
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-property-editor__widget-meta {
    display: flex;
    flex-direction: column;
}
.designer-property-editor__widget-type {
    font-weight: 600;
    font-size: 0.8125rem;
}
.designer-property-editor__widget-id {
    font-size: 0.6875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-family: monospace;
}
.designer-property-editor__content {
    flex: 1;
    overflow-y: auto;
}
.designer-property-editor__size {
    padding: 12px;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
