/**
 * Designer Selection composable
 * Handles click-select, keyboard shortcuts (Del, Esc, Ctrl+Z, Ctrl+S)
 */
import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

import { useDesignerState } from './useDesignerState.js'

export function useDesignerSelection ({ onSave, onUndo, onLeave, onDeleteWidget }) {
    const store = useStore()
    const { selection, clearSelection, enabled } = useDesignerState()

    function handleKeydown (event) {
        if (!enabled.value) return

        // Delete selected widget
        if (event.key === 'Delete' && selection.value) {
            event.preventDefault()
            if (typeof onDeleteWidget === 'function') {
                onDeleteWidget(selection.value)
            }
        }

        // Escape - clear selection or leave edit mode
        if (event.key === 'Escape') {
            event.preventDefault()
            if (selection.value) {
                clearSelection()
            } else if (typeof onLeave === 'function') {
                onLeave()
            }
        }

        // Ctrl+Z - undo
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
            event.preventDefault()
            if (typeof onUndo === 'function') {
                onUndo()
            }
        }

        // Ctrl+S - save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault()
            if (typeof onSave === 'function') {
                onSave()
            }
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown)
    })

    return {
        selection,
        clearSelection
    }
}
