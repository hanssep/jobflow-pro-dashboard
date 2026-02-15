/**
 * Designer Drag-Drop composable
 * Handles palette→canvas drag and widget reposition
 */
import { useStore } from 'vuex'

import { getWidgetDefaults } from '../services/WidgetTypeService.js'
import { useDesignerState } from './useDesignerState.js'

export function useDesignerDragDrop () {
    const store = useStore()
    const { endDrag, selectWidget } = useDesignerState()

    /**
     * Handle a widget drop from palette to canvas
     * @param {Object} payload - { widgetType, groupId, index }
     */
    async function handlePaletteDrop ({ widgetType, groupId, index }) {
        // Push undo snapshot before adding
        store.dispatch('wysiwyg/pushUndoSnapshot')

        // Get defaults for the widget type
        const defaults = getWidgetDefaults(store, widgetType) || {}

        try {
            const newWidget = await store.dispatch('wysiwyg/addWidget', {
                type: widgetType,
                group: groupId,
                name: defaults.name || widgetType.replace('ui-', ''),
                order: index,
                height: defaults.height || 1,
                width: defaults.width || 3,
                props: defaults
            })

            // Auto-select the new widget
            if (newWidget) {
                selectWidget(newWidget.id, widgetType)
            }

            endDrag()
            return newWidget
        } catch (error) {
            console.error('[useDesignerDragDrop] Failed to add widget:', error)
            endDrag()
            throw error
        }
    }

    return {
        handlePaletteDrop
    }
}
