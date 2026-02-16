const state = () => ({
    creatingPageId: null,
    activePageId: null
})

const getters = {
    isEditing (state) {
        return !!state.activePageId
    }
}

const mutations = {
    setCreatingPageId (state, pageId) {
        state.creatingPageId = pageId
    },
    clearCreatingPageId (state) {
        state.creatingPageId = null
    },
    setActivePageId (state, pageId) {
        state.activePageId = pageId
    },
    clearActivePageId (state) {
        state.activePageId = null
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
