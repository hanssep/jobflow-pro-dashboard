/**
 * Vuex module: Designer state management
 * Tracks selection, drag state, and panel visibility for the dashboard designer
 */

// initial state
const state = () => ({
    enabled: false,          // Whether designer mode is active (vs basic WYSIWYG)
    selection: null,         // { type: 'widget'|'group', id: string, widgetType?: string } | null
    multiSelection: [],      // Array of { type, id, widgetType? } for multi-select
    clipboard: null,         // { type: 'widget', data: { widgetType, props, layout } } | null
    styleClipboard: null,    // { widgetType: string, props: { key: value } } | null
    dragState: {
        active: false,
        source: null,        // 'palette' | 'canvas'
        widgetType: null,    // e.g. 'ui-button'
        data: null           // Additional drag data
    },
    panels: {
        palette: true,       // Left panel visible
        properties: true, // Right panel visible
        themeEditor: false // Theme editor panel visible
    },
    activeBreakpoint: 'auto' // Current responsive breakpoint for editing
})

const getters = {
    isEnabled (state) {
        return state.enabled
    },
    selection (state) {
        return state.selection
    },
    selectedWidgetId (state) {
        return state.selection?.id || null
    },
    selectedWidgetType (state) {
        return state.selection?.widgetType || null
    },
    isDragging (state) {
        return state.dragState.active
    },
    dragSource (state) {
        return state.dragState.source
    },
    dragWidgetType (state) {
        return state.dragState.widgetType
    },
    isPaletteVisible (state) {
        return state.panels.palette
    },
    isPropertiesVisible (state) {
        return state.panels.properties
    },
    isThemeEditorVisible (state) {
        return state.panels.themeEditor
    },
    multiSelection (state) {
        return state.multiSelection
    },
    isMultiSelected: (state) => (id) => {
        return state.multiSelection.some(s => s.id === id)
    },
    multiSelectionCount (state) {
        return state.multiSelection.length
    },
    activeBreakpoint (state) {
        return state.activeBreakpoint
    }
}

const mutations = {
    SET_ENABLED (state, enabled) {
        state.enabled = enabled
    },
    SELECT (state, selection) {
        // selection: { type: 'widget', id, widgetType }
        state.selection = selection ? { ...selection } : null
    },
    CLEAR_SELECTION (state) {
        state.selection = null
        state.multiSelection = []
    },
    TOGGLE_MULTI_SELECT (state, item) {
        // If there's a current selection not yet in multiSelection, add it first
        if (state.selection && !state.multiSelection.some(s => s.id === state.selection.id)) {
            state.multiSelection.push({ ...state.selection })
        }
        const idx = state.multiSelection.findIndex(s => s.id === item.id)
        if (idx >= 0) {
            state.multiSelection.splice(idx, 1)
            // If we removed the primary selection, set to last in multi or null
            if (state.selection?.id === item.id) {
                const last = state.multiSelection[state.multiSelection.length - 1]
                state.selection = last || null
            }
        } else {
            state.multiSelection.push({ ...item })
            state.selection = { ...item }
        }
    },
    SELECT_ALL (state, items) {
        state.multiSelection = items.map(i => ({ ...i }))
        state.selection = items.length ? { ...items[items.length - 1] } : null
    },
    START_DRAG (state, { source, widgetType, data }) {
        state.dragState = {
            active: true,
            source,
            widgetType,
            data: data || null
        }
    },
    END_DRAG (state) {
        state.dragState = {
            active: false,
            source: null,
            widgetType: null,
            data: null
        }
    },
    TOGGLE_PALETTE (state) {
        state.panels.palette = !state.panels.palette
    },
    TOGGLE_PROPERTIES (state) {
        state.panels.properties = !state.panels.properties
        // Mutually exclusive with theme editor
        if (state.panels.properties) {
            state.panels.themeEditor = false
        }
    },
    TOGGLE_THEME_EDITOR (state) {
        state.panels.themeEditor = !state.panels.themeEditor
        // Mutually exclusive with properties panel
        if (state.panels.themeEditor) {
            state.panels.properties = false
        }
    },
    SET_PANEL_VISIBILITY (state, { panel, visible }) {
        if (panel in state.panels) {
            state.panels[panel] = visible
        }
    },
    SET_CLIPBOARD (state, clipboard) {
        state.clipboard = clipboard ? { ...clipboard } : null
    },
    SET_STYLE_CLIPBOARD (state, data) {
        state.styleClipboard = data ? { ...data } : null
    },
    SET_ACTIVE_BREAKPOINT (state, bp) {
        state.activeBreakpoint = bp || 'auto'
    }
}

const actions = {
    enable ({ commit }) {
        commit('SET_ENABLED', true)
    },
    disable ({ commit }) {
        commit('SET_ENABLED', false)
        commit('CLEAR_SELECTION')
        commit('END_DRAG')
    },
    selectWidget ({ commit }, { id, widgetType, addToSelection }) {
        const item = { type: 'widget', id, widgetType }
        if (addToSelection) {
            commit('TOGGLE_MULTI_SELECT', item)
        } else {
            commit('SELECT', item)
        }
    },
    selectGroup ({ commit }, { id }) {
        commit('SELECT', { type: 'group', id })
    },
    clearSelection ({ commit }) {
        commit('CLEAR_SELECTION')
    },
    selectAll ({ commit }, items) {
        commit('SELECT_ALL', items)
    },
    startDrag ({ commit }, payload) {
        commit('START_DRAG', payload)
    },
    endDrag ({ commit }) {
        commit('END_DRAG')
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
