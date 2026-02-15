/**
 * Vuex module: Widget type registry
 * Caches available widget types fetched from the server
 */

const state = () => ({
    types: {},        // { [typeName]: { type, label, icon, category, defaults, isCore } }
    categories: [],   // [{ id, label, icon, order }]
    loaded: false,
    loading: false,
    error: null
})

const getters = {
    allTypes (state) {
        return state.types
    },
    typesList (state) {
        return Object.values(state.types)
    },
    getType: (state) => (typeName) => {
        return state.types[typeName] || null
    },
    categories (state) {
        return state.categories
    },
    typesByCategory: (state) => (categoryId) => {
        return Object.values(state.types).filter(t => t.category === categoryId)
    },
    isLoaded (state) {
        return state.loaded
    },
    isLoading (state) {
        return state.loading
    },
    // Returns only widget types that can be placed on a canvas (have group in defaults)
    placeableTypes (state) {
        return Object.values(state.types).filter(t => {
            return t.defaults && t.defaults.group !== undefined
        })
    }
}

const mutations = {
    SET_TYPES (state, types) {
        state.types = types
    },
    SET_CATEGORIES (state, categories) {
        state.categories = categories
    },
    SET_LOADED (state, loaded) {
        state.loaded = loaded
    },
    SET_LOADING (state, loading) {
        state.loading = loading
    },
    SET_ERROR (state, error) {
        state.error = error
    }
}

const actions = {
    /**
     * Load widget types from the server response
     * @param {Object} data - { types, categories } from the API
     */
    loadTypes ({ commit }, { types, categories }) {
        commit('SET_TYPES', types || {})
        commit('SET_CATEGORIES', categories || [])
        commit('SET_LOADED', true)
        commit('SET_LOADING', false)
        commit('SET_ERROR', null)
    },
    setLoading ({ commit }) {
        commit('SET_LOADING', true)
    },
    setError ({ commit }, error) {
        commit('SET_ERROR', error)
        commit('SET_LOADING', false)
    },
    clear ({ commit }) {
        commit('SET_TYPES', {})
        commit('SET_CATEGORIES', [])
        commit('SET_LOADED', false)
        commit('SET_ERROR', null)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
