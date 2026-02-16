import { markRaw } from 'vue'

import { endEditMode, startEditTracking } from '../EditTracking.js'
import UISpacer from '../widgets/ui-spacer/UISpacer.vue'

// initial state
const state = () => ({
    originalGroups: null,
    originalWidgets: null,
    shadowWidgets: null, // this is used to store widgets that have been removed during an edit session
    undoStack: [], // snapshots of {groups, widgets} for undo support
    redoStack: [] // snapshots for redo support
})

// getters
const getters = {
    // edit time tracking:
    originalGroups (state) {
        return state.originalGroups
    },
    originalWidgets (state) {
        return state.originalWidgets
    },
    canUndo (state) {
        return state.undoStack.length > 0
    },
    canRedo (state) {
        return state.redoStack.length > 0
    },
    isDirty: (state, getters, rootState) => (pageId, groups = null, widgets = null) => {
        // when groups are passed in, they are an array of groups, convert to a key-value object
        if (groups) {
            groups = flattenPageGroups(groups)
        }
        // when widgets are passed in, they are in a nested object {groupId:{ id: widget1, id: widget2 } structure
        // so we need to flatten them to a key-value object
        if (widgets) {
            widgets = flattenPageWidgets(widgets)
        }

        const originalWidgets = state.originalWidgets || {}
        const currentWidgets = widgets || rootState.ui.widgets || {}
        const originalGroups = state.originalGroups || {}
        const currentGroups = groups || rootState.ui.groups || {}

        let originalGroupsCount = 0
        let currentGroupsCount = 0
        let originalWidgetsCount = 0
        let currentWidgetsCount = 0

        // first filter to only items of interest (those matching the currentGroupId)
        const originalPageGroups = new Map()
        const originalPageGroupsWidgets = new Map()
        const currentPageGroups = new Map()
        const currentPageGroupsWidgets = new Map()
        for (const key in originalGroups) {
            if (originalGroups[key].page === pageId) {
                originalPageGroups.set(originalGroups[key].id, originalGroups[key])
                originalGroupsCount++
            }
        }
        for (const key in currentGroups) {
            if (currentGroups[key].page === pageId) {
                currentPageGroups.set(currentGroups[key].id, currentGroups[key])
                currentGroupsCount++
            }
        }
        for (const key in originalWidgets) {
            if (originalPageGroups.has(originalWidgets[key]?.props?.group)) {
                originalPageGroupsWidgets.set(originalWidgets[key].id, originalWidgets[key])
                originalWidgetsCount++
            }
        }
        for (const key in currentWidgets) {
            if (originalPageGroups.has(currentWidgets[key]?.props?.group)) {
                currentPageGroupsWidgets.set(currentWidgets[key].id, currentWidgets[key])
                currentWidgetsCount++
            }
        }

        // fast test: if the number of groups or widgets has changed, we are dirty
        if (originalGroupsCount !== currentGroupsCount) {
            return true
        }
        if (originalWidgetsCount !== currentWidgetsCount) {
            return true
        }

        // scan test: compare each group and widget
        const groupPropertiesToCheck = [
            (original, current) => +original.width === +current.width,
            (original, current) => +original.height === +current.height,
            (original, current) => +original.order === +current.order
        ]
        for (let idx = 0; idx < originalGroupsCount.length; idx++) {
            const originalGroup = originalGroupsCount[idx]
            const group = currentGroups[originalGroup.id]
            if (!group) {
                return true
            }
            for (const check of groupPropertiesToCheck) {
                if (!check(originalGroup, group)) {
                    return true
                }
            }
        }

        const widgetPropertiesToCheck = [
            (original, current) => +original.layout?.width === +current.layout?.width,
            (original, current) => +original.layout?.height === +current.layout?.height,
            (original, current) => +original.layout?.order === +current.layout?.order,
            (original, current) => +original.props?.width === +current.props?.width,
            (original, current) => +original.props?.height === +current.props?.height,
            (original, current) => +original.props?.order === +current.props?.order,
            // Check for property changes beyond dimensions (designer may change labels, colors, etc.)
            (original, current) => {
                const origProps = original.props || {}
                const currProps = current.props || {}
                // Quick check: compare JSON of key properties (excluding transient ones)
                const skip = new Set(['_users', 'enabled', 'visible'])
                for (const k of Object.keys(currProps)) {
                    if (skip.has(k)) continue
                    if (JSON.stringify(origProps[k]) !== JSON.stringify(currProps[k])) return false
                }
                for (const k of Object.keys(origProps)) {
                    if (skip.has(k)) continue
                    if (!(k in currProps)) return false
                }
                return true
            }
        ]
        const pageGroupsWidgetsArray = Array.from(originalPageGroupsWidgets.values())
        for (let idx = 0; idx < originalWidgetsCount; idx++) {
            const originalWidget = pageGroupsWidgetsArray[idx]
            const widget = currentWidgets[originalWidget.id]
            if (!widget) {
                return true // not found must be dirty
            }
            for (const check of widgetPropertiesToCheck) {
                if (!check(originalWidget, widget)) {
                    return true
                }
            }
        }
        return false
    }
}

const mutations = {
    originalGroups (state, groups) {
        state.originalGroups = groups
    },
    originalWidgets (state, widgets) {
        state.originalWidgets = widgets
    },
    // addWidget (state, widget) {
    //     state.widgets[widget.id] = widget
    // },
    // removeWidget (state, widgetId) {
    //     state.shadowWidgets[widgetId] = state.widgets[widgetId]
    //     delete state.widgets[widgetId]
    // },
    shadowWidgets (state, widgets) {
        state.shadowWidgets = widgets
    },
    pushUndoSnapshot (state, snapshot) {
        state.undoStack.push(snapshot)
        // cap at 50 snapshots to limit memory
        if (state.undoStack.length > 50) {
            state.undoStack.shift()
        }
        // Any new change clears the redo stack (standard behavior)
        state.redoStack = []
    },
    popUndoSnapshot (state) {
        return state.undoStack.pop()
    },
    pushRedoSnapshot (state, snapshot) {
        state.redoStack.push(snapshot)
        if (state.redoStack.length > 50) {
            state.redoStack.shift()
        }
    },
    popRedoSnapshot (state) {
        return state.redoStack.pop()
    },
    clearUndoStack (state) {
        state.undoStack = []
        state.redoStack = []
    }
}
const actions = {
    addSpacer ({ rootState, state, commit }, { group, name, order, height, width }) {
        console.log('addSpacer', group, name, order, height, width)
        if (!group) {
            throw new Error('group is required')
        }
        // ensure group exists in state.groups
        if (!rootState.ui.groups[group]) {
            throw new Error('group does not exist')
        }

        const widget = {
            id: newId(),
            type: 'ui-spacer',
            name: 'spacer',
            component: markRaw(UISpacer),
            props: {
                group,
                name: name || 'spacer',
                tooltip: '',
                order: order ?? 0,
                width: width ?? 1,
                height: height ?? 1,
                className: '',
                _users: [],
                enabled: true,
                visible: true
            },
            layout: {
                order: order ?? 0,
                width: width ?? 1,
                height: height ?? 1
            },
            state: { enabled: true, visible: true, class: '' }
        }
        rootState.ui.widgets[widget.id] = widget
        commit('ui/widgets', rootState.ui.widgets, { root: true })
        return widget
    },
    addWidget ({ rootState, state, commit }, { type, group, name, order, height, width, props }) {
        if (!group) {
            throw new Error('group is required')
        }
        if (!rootState.ui.groups[group]) {
            throw new Error('group does not exist')
        }
        if (!type || !type.startsWith('ui-')) {
            throw new Error('invalid widget type')
        }

        // For spacers, use the existing spacer component
        // For other types, use the spacer as a placeholder (rendered as dashed box)
        const component = markRaw(UISpacer)

        const defaultProps = {
            group,
            name: name || type.replace('ui-', ''),
            tooltip: '',
            order: order ?? 0,
            width: width ?? 3,
            height: height ?? 1,
            className: '',
            _users: [],
            enabled: true,
            visible: true,
            ...(props || {})
        }

        const widget = {
            id: newId(),
            type,
            name: defaultProps.name,
            component,
            props: defaultProps,
            layout: {
                order: defaultProps.order,
                width: defaultProps.width,
                height: defaultProps.height
            },
            state: { enabled: true, visible: true, class: '' },
            __DB2_DESIGNER_ADDED: true
        }
        rootState.ui.widgets[widget.id] = widget
        commit('ui/widgets', rootState.ui.widgets, { root: true })
        return widget
    },
    updateGroupProperty ({ rootState, commit }, { id, key, value }) {
        const group = rootState.ui.groups[id]
        if (!group) {
            throw new Error('Group not found: ' + id)
        }
        group[key] = value
        commit('ui/groups', { ...rootState.ui.groups }, { root: true })
    },
    updateWidgetProperty ({ rootState, commit }, { id, key, value }) {
        const widget = rootState.ui.widgets[id]
        if (!widget) {
            throw new Error('Widget not found: ' + id)
        }
        // Update the props
        widget.props[key] = value
        // If it's a layout property, also update layout
        if (key === 'width' || key === 'height' || key === 'order') {
            widget.layout[key] = value
        }
        commit('ui/widgets', rootState.ui.widgets, { root: true })
    },
    removeWidget ({ rootState, state, commit }, payload) {
        state.shadowWidgets[payload.id] = rootState.ui.widgets[payload.id]
        delete rootState.ui.widgets[payload.id]
        commit('ui/widgets', rootState.ui.widgets, { root: true })
    },
    /**
     * @param {import('vuex').ActionContext} context
     * @param {Object} payload
     * @param {import('./ui.mjs').Groups} payload.groups
     * @param {import('./ui.mjs').Widgets} payload.widgets
     */
    beginEditTracking ({ dispatch, state }, { groups, widgets }) {
        console.log('beginEditTracking')
        startEditTracking() // EditTracking method
        dispatch('updateEditTracking', { groups, widgets })
        state.shadowWidgets = {}
    },
    /**
     * @param {import('vuex').ActionContext} context
     * @param {Object} payload
     * @param {Array<import('./ui.mjs').Groups>} payload.groups
     * @param {import('./ui.mjs').GroupsWidgets} payload.widgets
     */
    updateEditTracking ({ commit }, { groups, widgets }) {
        console.log('updateEditTracking')
        commit('originalGroups', JSON.parse(JSON.stringify(flattenPageGroups(groups))))
        const slimCopy = {}
        /** @type {import('./ui.mjs').Widgets} */
        const src = flattenPageWidgets(widgets)
        for (const key in src) {
            const w = src[key]
            slimCopy[key] = {
                id: w.id,
                type: w.type,
                props: { ...w.props },
                layout: { ...w.layout }
            }
        }
        commit('originalWidgets', slimCopy)
    },
    revertEdits ({ rootState, state, commit }) {
        console.log('revertEdits')
        const uiWidgets = rootState.ui.widgets
        const uiGroups = rootState.ui.groups
        const groupPropertiesOfInterest = ['width', 'height', 'order']
        for (const key in uiGroups) {
            const existingGroup = uiGroups[key]
            const originalGroup = state.originalGroups[key]
            if (!originalGroup) {
                // group was added, remove it
                delete uiGroups[key]
            }
            if (originalGroup) {
                for (const prop of groupPropertiesOfInterest) {
                    existingGroup[prop] = originalGroup[prop]
                }
            }
        }

        /** @type {Widgets} */
        const originalWidgets = state.originalWidgets
        const widgetLayoutPropertiesOfInterest = ['width', 'height', 'order']
        const widgetPropsPropertiesOfInterest = ['width', 'height', 'order']
        for (const key in originalWidgets) {
            const originalWidget = originalWidgets[key]
            if (!uiWidgets[key] && originalWidget) {
                // widget was removed, bring it back
                uiWidgets[key] = state.shadowWidgets[key]
            }
            if (uiWidgets[key] && !originalWidget) {
                // widget was added, remove it
                delete uiWidgets[key]
            }
            if (uiWidgets[key] && originalWidget) {
                for (const prop of widgetPropsPropertiesOfInterest) {
                    uiWidgets[key].props[prop] = originalWidget.props[prop]
                }
                for (const prop of widgetLayoutPropertiesOfInterest) {
                    uiWidgets[key].layout[prop] = originalWidget.layout[prop]
                }
            }
        }
        // now scan for widgets that were added to uiWidgets and do not exist in originalWidgets
        for (const key in uiWidgets) {
            if (!originalWidgets[key]) {
                delete uiWidgets[key]
            }
        }
        commit('shadowWidgets', {}) // reset the shadow widgets since we have reverted the changes
        commit('clearUndoStack') // clear undo stack since we've reverted to original
        commit('ui/widgets', uiWidgets, { root: true })
        commit('ui/groups', uiGroups, { root: true })
    },
    pushUndoSnapshot ({ rootState, commit }) {
        const uiGroups = rootState.ui.groups
        const uiWidgets = rootState.ui.widgets
        const snapshot = {
            groups: JSON.parse(JSON.stringify(uiGroups)),
            widgets: {}
        }
        for (const key in uiWidgets) {
            const w = uiWidgets[key]
            snapshot.widgets[key] = {
                id: w.id,
                type: w.type,
                props: { ...w.props },
                layout: { ...w.layout }
            }
        }
        commit('pushUndoSnapshot', snapshot)
    },
    popUndoSnapshot ({ rootState, state, commit }) {
        if (state.undoStack.length === 0) {
            return false
        }
        // Save current state to redo stack before restoring
        const redoSnapshot = _captureCurrentState(rootState)
        commit('pushRedoSnapshot', redoSnapshot)

        const snapshot = state.undoStack.pop()
        // restore groups
        const uiGroups = rootState.ui.groups
        const groupPropertiesOfInterest = ['width', 'height', 'order']
        for (const key in snapshot.groups) {
            if (uiGroups[key]) {
                for (const prop of groupPropertiesOfInterest) {
                    uiGroups[key][prop] = snapshot.groups[key][prop]
                }
            }
        }
        // restore widgets
        const uiWidgets = rootState.ui.widgets
        const widgetPropsOfInterest = ['width', 'height', 'order', 'group']
        const widgetLayoutOfInterest = ['width', 'height', 'order']
        // restore existing widgets from snapshot
        for (const key in snapshot.widgets) {
            if (uiWidgets[key]) {
                for (const prop of widgetPropsOfInterest) {
                    if (snapshot.widgets[key].props[prop] !== undefined) {
                        uiWidgets[key].props[prop] = snapshot.widgets[key].props[prop]
                    }
                }
                for (const prop of widgetLayoutOfInterest) {
                    if (snapshot.widgets[key].layout && snapshot.widgets[key].layout[prop] !== undefined) {
                        uiWidgets[key].layout[prop] = snapshot.widgets[key].layout[prop]
                    }
                }
            } else if (state.shadowWidgets[key]) {
                // widget was removed, bring it back
                uiWidgets[key] = state.shadowWidgets[key]
                delete state.shadowWidgets[key]
            }
        }
        // remove widgets added after snapshot
        for (const key in uiWidgets) {
            if (!snapshot.widgets[key]) {
                state.shadowWidgets[key] = uiWidgets[key]
                delete uiWidgets[key]
            }
        }
        commit('ui/widgets', uiWidgets, { root: true })
        commit('ui/groups', uiGroups, { root: true })
        return true
    },
    endEditTracking ({ commit }) {
        console.log('endEditTracking')
        endEditMode() // EditTracking method
        commit('originalGroups', null)
        commit('originalWidgets', null)
        commit('shadowWidgets', null)
        commit('clearUndoStack')
    },
    redo ({ rootState, state, commit }) {
        if (state.redoStack.length === 0) {
            return false
        }
        // Save current state to undo stack
        const undoSnapshot = _captureCurrentState(rootState)
        state.undoStack.push(undoSnapshot)
        if (state.undoStack.length > 50) {
            state.undoStack.shift()
        }

        const snapshot = state.redoStack.pop()
        // restore from redo snapshot (same logic as popUndoSnapshot)
        const uiGroups = rootState.ui.groups
        const groupPropertiesOfInterest = ['width', 'height', 'order']
        for (const key in snapshot.groups) {
            if (uiGroups[key]) {
                for (const prop of groupPropertiesOfInterest) {
                    uiGroups[key][prop] = snapshot.groups[key][prop]
                }
            }
        }
        const uiWidgets = rootState.ui.widgets
        const widgetPropsOfInterest = ['width', 'height', 'order', 'group']
        const widgetLayoutOfInterest = ['width', 'height', 'order']
        for (const key in snapshot.widgets) {
            if (uiWidgets[key]) {
                for (const prop of widgetPropsOfInterest) {
                    if (snapshot.widgets[key].props[prop] !== undefined) {
                        uiWidgets[key].props[prop] = snapshot.widgets[key].props[prop]
                    }
                }
                for (const prop of widgetLayoutOfInterest) {
                    if (snapshot.widgets[key].layout && snapshot.widgets[key].layout[prop] !== undefined) {
                        uiWidgets[key].layout[prop] = snapshot.widgets[key].layout[prop]
                    }
                }
            } else if (state.shadowWidgets[key]) {
                uiWidgets[key] = state.shadowWidgets[key]
                delete state.shadowWidgets[key]
            }
        }
        for (const key in uiWidgets) {
            if (!snapshot.widgets[key]) {
                state.shadowWidgets[key] = uiWidgets[key]
                delete uiWidgets[key]
            }
        }
        commit('ui/widgets', uiWidgets, { root: true })
        commit('ui/groups', uiGroups, { root: true })
        return true
    }
}

function _captureCurrentState (rootState) {
    const uiGroups = rootState.ui.groups
    const uiWidgets = rootState.ui.widgets
    const snapshot = {
        groups: JSON.parse(JSON.stringify(uiGroups)),
        widgets: {}
    }
    for (const key in uiWidgets) {
        const w = uiWidgets[key]
        snapshot.widgets[key] = {
            id: w.id,
            type: w.type,
            props: { ...w.props },
            layout: { ...w.layout }
        }
    }
    return snapshot
}

function newId () {
    return Date.now().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10)
}

/**
 * Flattens the PageGroups array to a flat lookup object
 * @param {import('./ui.mjs').PageGroups} groups
 * @returns {Object.<string, Group>}
 */
function flattenPageGroups (groups) {
    const flat = {}
    for (const key in groups) {
        const g = groups[key]
        flat[g.id] = g
    }
    return flat
}

/**
 * Flattens the PageGroupsWidgets object to a flat lookup object
 * @param {import('./ui.mjs').PageGroupsWidgets} groupWidgets
 * @returns {Object.<string, Widget>} - Widget ID to Widget lookup
 */
function flattenPageWidgets (groupWidgets) {
    const flat = {}
    for (const groupId in groupWidgets) {
        const widgets = groupWidgets[groupId]
        for (let idx = 0; idx < widgets.length; idx++) {
            const w = widgets[idx]
            flat[w.id] = w
        }
    }
    return flat
}

export default {
    namespaced: true,
    actions,
    state,
    getters,
    mutations
}
