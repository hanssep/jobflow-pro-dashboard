/**
 * Widget Type Service
 * Fetches and caches widget types from the server API
 */
import NodeRedApi from '../../api/node-red.js'

let cachedTypes = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch widget types from the server
 * @param {Object} store - Vuex store instance
 * @param {string} dashboard - Dashboard ID
 * @param {string} [editorPath] - Editor path for admin API
 * @param {boolean} [force=false] - Force refresh, bypass cache
 */
export async function fetchWidgetTypes (store, dashboard, editorPath, force = false) {
    const now = Date.now()

    // Return cached if still valid
    if (!force && cachedTypes && (now - cacheTime) < CACHE_TTL) {
        if (!store.getters['widgetTypes/isLoaded']) {
            store.dispatch('widgetTypes/loadTypes', cachedTypes)
        }
        return cachedTypes
    }

    store.dispatch('widgetTypes/setLoading')

    try {
        const response = await NodeRedApi.fetchWidgetTypes({ dashboard, editorPath })
        const data = response.data

        cachedTypes = data
        cacheTime = now

        store.dispatch('widgetTypes/loadTypes', data)
        return data
    } catch (error) {
        console.error('[WidgetTypeService] Failed to fetch widget types:', error)
        store.dispatch('widgetTypes/setError', error.message || 'Failed to fetch widget types')
        throw error
    }
}

/**
 * Invalidate the local cache
 */
export function invalidateCache () {
    cachedTypes = null
    cacheTime = 0
}

/**
 * Get default properties for a widget type
 * @param {Object} store - Vuex store instance
 * @param {string} typeName - Widget type name (e.g. 'ui-button')
 * @returns {Object|null} Default properties or null if type unknown
 */
export function getWidgetDefaults (store, typeName) {
    const typeInfo = store.getters['widgetTypes/getType'](typeName)
    if (!typeInfo || !typeInfo.defaults) {
        return null
    }

    // Extract values from the defaults schema
    const defaults = {}
    for (const [key, config] of Object.entries(typeInfo.defaults)) {
        defaults[key] = config.value
    }
    return defaults
}

export default {
    fetchWidgetTypes,
    invalidateCache,
    getWidgetDefaults
}
