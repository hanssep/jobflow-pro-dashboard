/**
 * Designer History composable
 * Extends the existing wysiwyg undo/redo stack with property change support
 */
import { computed } from 'vue'
import { useStore } from 'vuex'

export function useDesignerHistory () {
    const store = useStore()

    const canUndo = computed(() => store.getters['wysiwyg/canUndo'])

    function pushSnapshot () {
        store.dispatch('wysiwyg/pushUndoSnapshot')
    }

    function undo () {
        return store.dispatch('wysiwyg/popUndoSnapshot')
    }

    return {
        canUndo,
        pushSnapshot,
        undo
    }
}
