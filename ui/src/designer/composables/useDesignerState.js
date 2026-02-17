/**
 * Central state management composable for the Dashboard Designer
 * Provides reactive access to designer state from any component
 */
import { computed } from 'vue'
import { useStore } from 'vuex'

export function useDesignerState () {
    const store = useStore()

    const enabled = computed(() => store.getters['designer/isEnabled'])
    const selection = computed(() => store.getters['designer/selection'])
    const selectedWidgetId = computed(() => store.getters['designer/selectedWidgetId'])
    const selectedWidgetType = computed(() => store.getters['designer/selectedWidgetType'])
    const isDragging = computed(() => store.getters['designer/isDragging'])
    const dragSource = computed(() => store.getters['designer/dragSource'])
    const dragWidgetType = computed(() => store.getters['designer/dragWidgetType'])
    const isPaletteVisible = computed(() => store.getters['designer/isPaletteVisible'])
    const isPropertiesVisible = computed(() => store.getters['designer/isPropertiesVisible'])
    const isThemeEditorVisible = computed(() => store.getters['designer/isThemeEditorVisible'])

    // Widget types
    const widgetTypes = computed(() => store.getters['widgetTypes/allTypes'])
    const widgetCategories = computed(() => store.getters['widgetTypes/categories'])
    const placeableTypes = computed(() => store.getters['widgetTypes/placeableTypes'])
    const widgetTypesLoaded = computed(() => store.getters['widgetTypes/isLoaded'])
    const widgetTypesLoading = computed(() => store.getters['widgetTypes/isLoading'])

    function enable () {
        store.dispatch('designer/enable')
    }

    function disable () {
        store.dispatch('designer/disable')
    }

    function selectWidget (id, widgetType) {
        store.dispatch('designer/selectWidget', { id, widgetType })
    }

    function clearSelection () {
        store.dispatch('designer/clearSelection')
    }

    function startDrag (source, widgetType, data) {
        store.dispatch('designer/startDrag', { source, widgetType, data })
    }

    function endDrag () {
        store.dispatch('designer/endDrag')
    }

    function togglePalette () {
        store.commit('designer/TOGGLE_PALETTE')
    }

    function toggleProperties () {
        store.commit('designer/TOGGLE_PROPERTIES')
    }

    function toggleThemeEditor () {
        store.commit('designer/TOGGLE_THEME_EDITOR')
    }

    function getTypeInfo (typeName) {
        return store.getters['widgetTypes/getType'](typeName)
    }

    function getTypesByCategory (categoryId) {
        return store.getters['widgetTypes/typesByCategory'](categoryId)
    }

    return {
        // State
        enabled,
        selection,
        selectedWidgetId,
        selectedWidgetType,
        isDragging,
        dragSource,
        dragWidgetType,
        isPaletteVisible,
        isPropertiesVisible,
        isThemeEditorVisible,
        widgetTypes,
        widgetCategories,
        placeableTypes,
        widgetTypesLoaded,
        widgetTypesLoading,

        // Actions
        enable,
        disable,
        selectWidget,
        clearSelection,
        startDrag,
        endDrag,
        togglePalette,
        toggleProperties,
        toggleThemeEditor,
        getTypeInfo,
        getTypesByCategory
    }
}
