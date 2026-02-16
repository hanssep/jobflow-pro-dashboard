/**
 * Vuex module: Designer state management
 * Tracks selection, drag state, and panel visibility for the dashboard designer
 */

// initial state
const state = () => ({
    enabled: false,          // Whether designer mode is active (vs basic WYSIWYG)
    selection: null,         // { type: 'widget'|'group', id: string, widgetType?: string } | null
    clipboard: null,         // { type: 'widget', data: { widgetType, props, layout } } | null
    dragState: {
        active: false,
        source: null,        // 'palette' | 'canvas'
        widgetType: null,    // e.g. 'ui-button'
        data: null           // Additional drag data
    },
    panels: {
        palette: true,       // Left panel visible
        properties: true     // Right panel visible
    }
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
    },
    SET_PANEL_VISIBILITY (state, { panel, visible }) {
        if (panel in state.panels) {
            state.panels[panel] = visible
        }
    },
    SET_CLIPBOARD (state, clipboard) {
        state.clipboard = clipboard ? { ...clipboard } : null
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
    selectWidget ({ commit }, { id, widgetType }) {
        commit('SELECT', { type: 'widget', id, widgetType })
    },
    clearSelection ({ commit }) {
        commit('CLEAR_SELECTION')
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
