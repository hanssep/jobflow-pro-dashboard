<template>
    <div class="inspector-panel">
        <div class="inspector-panel__header">
            <v-icon size="18">mdi-tune</v-icon>
            <span class="inspector-panel__title">Inspector</span>
        </div>

        <!-- Nothing selected -->
        <div v-if="!selectionType && !isMultiSelect" class="inspector-panel__empty">
            <v-icon size="48" color="grey-lighten-1">mdi-cursor-default-click-outline</v-icon>
            <span>Select a widget or group to inspect</span>
        </div>

        <!-- Multi-select -->
        <template v-else-if="isMultiSelect">
            <div class="inspector-panel__info inspector-panel__info--multi">
                <v-icon size="20">mdi-select-group</v-icon>
                <div class="inspector-panel__meta">
                    <span class="inspector-panel__type-label">{{ multiSelectionCount }} widgets selected</span>
                </div>
            </div>
            <v-tabs v-model="activeTab" density="compact" class="inspector-panel__tabs">
                <v-tab value="content" size="small">Content</v-tab>
                <v-tab value="style" size="small">Style</v-tab>
                <v-tab value="layout" size="small">Layout</v-tab>
            </v-tabs>
            <div class="inspector-panel__content">
                <v-window v-model="activeTab">
                    <v-window-item value="content">
                        <div v-if="multiCommonFields.content.length" class="inspector-panel__fields">
                            <PropertyField
                                v-for="field in multiCommonFields.content"
                                :key="field.key"
                                :field="field"
                                @change="onMultiFieldChange"
                            />
                        </div>
                        <div v-else class="inspector-panel__tab-empty">No common content properties</div>
                    </v-window-item>
                    <v-window-item value="style">
                        <div v-if="multiCommonFields.style.length" class="inspector-panel__fields">
                            <PropertyField
                                v-for="field in multiCommonFields.style"
                                :key="field.key"
                                :field="field"
                                @change="onMultiFieldChange"
                            />
                        </div>
                        <div v-else class="inspector-panel__tab-empty">No common style properties</div>
                    </v-window-item>
                    <v-window-item value="layout">
                        <div class="inspector-panel__fields">
                            <PropertyField
                                v-for="field in multiCommonFields.layout"
                                :key="field.key"
                                :field="field"
                                @change="onMultiFieldChange"
                            />
                        </div>
                    </v-window-item>
                </v-window>
            </div>
        </template>

        <!-- Widget selected -->
        <template v-else-if="selectionType === 'widget'">
            <div class="inspector-panel__info">
                <v-icon size="20">{{ widgetTypeIcon }}</v-icon>
                <div class="inspector-panel__meta">
                    <span class="inspector-panel__type-label">{{ widgetTypeLabel }}</span>
                    <span class="inspector-panel__id">{{ selection.id }}</span>
                </div>
            </div>
            <v-tabs v-model="activeTab" density="compact" class="inspector-panel__tabs">
                <v-tab value="content" size="small">Content</v-tab>
                <v-tab value="style" size="small">Style</v-tab>
                <v-tab value="layout" size="small">Layout</v-tab>
            </v-tabs>
            <div class="inspector-panel__content">
                <v-window v-model="activeTab">
                    <v-window-item value="content">
                        <div v-if="studioSchema.content.length" class="inspector-panel__fields">
                            <PropertyField
                                v-for="field in studioSchema.content"
                                :key="field.key"
                                :field="field"
                                @change="onWidgetFieldChange"
                            />
                        </div>
                        <div v-else class="inspector-panel__tab-empty">No content properties</div>
                    </v-window-item>
                    <v-window-item value="style">
                        <div v-if="studioSchema.style.length" class="inspector-panel__fields">
                            <PropertyField
                                v-for="field in studioSchema.style"
                                :key="field.key"
                                :field="field"
                                @change="onWidgetFieldChange"
                            />
                        </div>
                        <div v-else class="inspector-panel__tab-empty">No style properties</div>
                    </v-window-item>
                    <v-window-item value="layout">
                        <div class="inspector-panel__fields">
                            <SizeField
                                v-if="hasSize"
                                :width="currentWidth"
                                :height="currentHeight"
                                @update:width="onSizeChange('width', $event)"
                                @update:height="onSizeChange('height', $event)"
                            />
                            <PropertyField
                                v-for="field in layoutFieldsWithoutSize"
                                :key="field.key"
                                :field="field"
                                @change="onWidgetFieldChange"
                            />
                        </div>
                    </v-window-item>
                </v-window>
            </div>
        </template>

        <!-- Group selected -->
        <template v-else-if="selectionType === 'group'">
            <div class="inspector-panel__info">
                <v-icon size="20">mdi-group</v-icon>
                <div class="inspector-panel__meta">
                    <span class="inspector-panel__type-label">Group</span>
                    <span class="inspector-panel__id">{{ selection.id }}</span>
                </div>
            </div>
            <div class="inspector-panel__content">
                <PropertySection
                    v-for="section in groupSchema.sections"
                    :key="section.id"
                    :section="section"
                    @field-change="onGroupFieldChange"
                />
            </div>
        </template>
    </div>
</template>

<script>
import { useDesignerState } from '../../designer/composables/useDesignerState.js'
import PropertyField from '../../designer/properties/PropertyField.vue'
import PropertySection from '../../designer/properties/PropertySection.vue'
import SizeField from '../../designer/properties/fields/SizeField.vue'
import { getStudioSchema } from '../../designer/services/WidgetSchemaService.js'
import { getGroupSchema } from '../services/GroupSchemaService.js'

export default {
    name: 'InspectorPanel',
    components: { PropertyField, PropertySection, SizeField },
    setup () {
        const { selection, getTypeInfo } = useDesignerState()
        return { selection, getTypeInfo }
    },
    data () {
        return {
            activeTab: 'content'
        }
    },
    computed: {
        multiSelection () {
            return this.$store.getters['designer/multiSelection'] || []
        },
        multiSelectionCount () {
            return this.$store.getters['designer/multiSelectionCount'] || 0
        },
        isMultiSelect () {
            return this.multiSelectionCount > 1
        },
        selectionType () {
            if (this.isMultiSelect) return null
            return this.selection?.type || null
        },
        selectedWidget () {
            if (this.selectionType !== 'widget') return null
            return this.$store.state.ui.widgets[this.selection.id]
        },
        selectedGroup () {
            if (this.selectionType !== 'group') return null
            return this.$store.state.ui.groups[this.selection.id]
        },
        widgetTypeInfo () {
            if (!this.selection) return null
            return this.getTypeInfo(this.selection.widgetType)
        },
        widgetTypeLabel () {
            return this.widgetTypeInfo?.label || this.selection?.widgetType || 'Widget'
        },
        widgetTypeIcon () {
            return this.widgetTypeInfo?.icon || 'mdi-puzzle-outline'
        },
        studioSchema () {
            if (!this.selection || !this.selectedWidget) {
                return { content: [], style: [], layout: [] }
            }
            return getStudioSchema(this.$store, this.selection.widgetType, this.selectedWidget.props)
        },
        layoutFieldsWithoutSize () {
            return this.studioSchema.layout.filter(f => f.key !== 'width' && f.key !== 'height')
        },
        hasSize () {
            return this.selectedWidget?.props?.width !== undefined || this.selectedWidget?.props?.height !== undefined
        },
        currentWidth () {
            return parseInt(this.selectedWidget?.props?.width) || 1
        },
        currentHeight () {
            return parseInt(this.selectedWidget?.props?.height) || 1
        },
        groupSchema () {
            if (!this.selectedGroup) return { sections: [] }
            return getGroupSchema(this.selectedGroup)
        },
        multiCommonFields () {
            if (!this.isMultiSelect) return { content: [], style: [], layout: [] }
            const widgets = this.multiSelection
                .filter(s => s.type === 'widget')
                .map(s => this.$store.state.ui.widgets[s.id])
                .filter(Boolean)
            if (widgets.length === 0) return { content: [], style: [], layout: [] }

            // Get schemas for all selected widgets
            const schemas = widgets.map((w, i) =>
                getStudioSchema(this.$store, this.multiSelection[i].widgetType, w.props)
            )

            // Find common keys across all schemas per tab
            const commonForTab = (tab) => {
                const keySets = schemas.map(s => new Set((s[tab] || []).map(f => f.key)))
                const commonKeys = [...keySets[0]].filter(k => keySets.every(set => set.has(k)))
                // Use fields from first schema, merge values
                const firstFields = schemas[0][tab] || []
                return commonKeys.map(key => {
                    const field = firstFields.find(f => f.key === key)
                    if (!field) return null
                    // Check if all widgets have same value
                    const values = widgets.map(w => w.props?.[key])
                    const allSame = values.every(v => v === values[0])
                    return {
                        ...field,
                        value: allSame ? values[0] : undefined,
                        placeholder: allSame ? undefined : 'Mixed'
                    }
                }).filter(Boolean)
            }

            return {
                content: commonForTab('content'),
                style: commonForTab('style'),
                layout: commonForTab('layout')
            }
        }
    },
    watch: {
        selection () {
            this.activeTab = 'content'
        }
    },
    methods: {
        onWidgetFieldChange ({ key, value }) {
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
        },
        onGroupFieldChange ({ key, value }) {
            if (!this.selectedGroup) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('wysiwyg/updateGroupProperty', {
                id: this.selection.id,
                key,
                value
            })
        },
        onMultiFieldChange ({ key, value }) {
            if (!this.isMultiSelect) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            const widgetItems = this.multiSelection.filter(s => s.type === 'widget')
            for (const item of widgetItems) {
                this.$store.dispatch('wysiwyg/updateWidgetProperty', {
                    id: item.id,
                    key,
                    value
                })
            }
        }
    }
}
</script>

<style scoped>
.inspector-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.inspector-panel__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.inspector-panel__title {
    flex: 1;
}
.inspector-panel__empty {
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
.inspector-panel__info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background-color: rgba(var(--v-theme-primary), 0.06);
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.inspector-panel__info--multi {
    background-color: rgba(var(--v-theme-info), 0.08);
}
.inspector-panel__meta {
    display: flex;
    flex-direction: column;
}
.inspector-panel__type-label {
    font-weight: 600;
    font-size: 0.8125rem;
}
.inspector-panel__id {
    font-size: 0.6875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-family: monospace;
}
.inspector-panel__tabs {
    min-height: 36px;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.inspector-panel__tabs :deep(.v-tab) {
    font-family: 'Exo 2', sans-serif;
    font-size: 12px;
    text-transform: none;
    font-weight: 600;
    min-width: 0;
    padding: 0 12px;
}
.inspector-panel__content {
    flex: 1;
    overflow-y: auto;
}
.inspector-panel__fields {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.inspector-panel__tab-empty {
    padding: 24px;
    text-align: center;
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
}
</style>
