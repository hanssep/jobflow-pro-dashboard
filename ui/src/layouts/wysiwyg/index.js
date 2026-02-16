import { mapGetters } from 'vuex'

import { editKey, editMode, editPage, editorPath, isTrackingEdits } from '../../EditTracking.js'
import NodeRedApi from '../../api/node-red'

import DraggableGroupMixin from './draggableGroup.js'
import DraggableWidgetMixin from './draggableWidget.js'
import ResizableMixin from './resizable.js'

export default {
    mixins: [DraggableGroupMixin, DraggableWidgetMixin, ResizableMixin],
    data () {
        return {
            pageGroups: [],
            pageGroupWidgets: [],
            _keydownHandler: null
        }
    },
    emits: ['refresh-state-from-store'],
    computed: {
        ...mapGetters('wysiwyg', ['isDirty', 'originalGroups', 'originalWidgets', 'canUndo']),
        dirty () {
            if (!this.editMode || !isTrackingEdits.value) {
                return false
            }
            return this.isDirty(this.page.id, this.pageGroups, this.pageGroupWidgets)
        },
        editMode: function () {
            return editMode.value && editPage.value === this.$route.meta.id
        }
    },
    watch: {
        editMode (active) {
            if (active) {
                this._bindKeyboard()
            } else {
                this._unbindKeyboard()
            }
        }
    },
    mounted () {
        if (this.editMode) {
            this._bindKeyboard()
        }
    },
    beforeUnmount () {
        this._unbindKeyboard()
    },
    methods: {
        _bindKeyboard () {
            if (this._keydownHandler) return
            this._keydownHandler = (e) => {
                if (!this.editMode) return
                // Ctrl+S / Cmd+S → save
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault()
                    if (this.dirty && !this.saving) {
                        this.saveEdits()
                    }
                }
                // Ctrl+Z / Cmd+Z → undo
                if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault()
                    this.undoEdit()
                }
                // Escape → leave edit mode
                if (e.key === 'Escape') {
                    e.preventDefault()
                    this.leaveEditMode()
                }
            }
            window.addEventListener('keydown', this._keydownHandler)
        },
        _unbindKeyboard () {
            if (this._keydownHandler) {
                window.removeEventListener('keydown', this._keydownHandler)
                this._keydownHandler = null
            }
        },
        pushUndoSnapshot () {
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
        },
        undoEdit () {
            this.$store.dispatch('wysiwyg/popUndoSnapshot').then((restored) => {
                if (restored) {
                    this.$emit('refresh-state-from-store')
                    if (typeof this.updateEditStateObjects === 'function') {
                        this.updateEditStateObjects()
                    }
                }
            })
        },
        initializeEditTracking () {
            if (this.editMode && !isTrackingEdits.value) {
                this.$store.dispatch('wysiwyg/beginEditTracking', { groups: this.pageGroups, widgets: this.pageGroupWidgets })
            }
        },
        acceptChanges () {
            this.$store.dispatch('wysiwyg/updateEditTracking', { groups: this.pageGroups, widgets: this.pageGroupWidgets })
            this.$store.commit('wysiwyg/clearUndoStack') // baseline updated, undo history no longer valid
        },
        exitEditMode () {
            const fromStudio = this.$route.query.from === 'studio'
            const url = new URL(window.location.href)
            url.searchParams.delete('edit-key')
            url.searchParams.delete('from')
            url.searchParams.delete('editor-path')
            const query = { ...this.$route.query }
            delete query['edit-key']
            delete query.from
            if (fromStudio) {
                // Navigate back to Studio view
                const basePath = this.$store.state.setup.basePath || ''
                const studioPath = (basePath + '/_studio').replace(/\/\//g, '/')
                this.$router.push(studioPath)
            } else {
                this.$router.replace({ query })
            }
            window.history.replaceState({}, document.title, url)
            this.$store.dispatch('wysiwyg/endEditTracking')
        },
        revertEdits () {
            console.log('revertEdits')
            this.$store.dispatch('wysiwyg/revertEdits').then(() => {
                console.log('reverted edits')
                this.$emit('refresh-state-from-store')
            }).catch((error) => {
                console.error('Error reverting edits', error)
            })
        },
        async deployChanges ({ dashboard, page, groups, widgets }) {
            console.log('deployChanges', dashboard, page, groups, widgets)
            const normalisedWidgetsAll = new Map()
            const normaliseWidget = widget => {
                return {
                    id: widget.id,
                    type: widget.type,
                    ...widget.props
                }
            }

            // first normalise the widgets ready for Node-RED
            const widgetGroups = Object.keys(widgets)
            for (const groupId of widgetGroups) {
                const groupWidgets = widgets[groupId]
                if (!groupWidgets?.length) { continue }
                const normalised = groupWidgets.map(normaliseWidget)
                for (const widget of normalised) {
                    if (!widget.id || !widget.type) {
                        return Promise.reject(new Error('Widget is missing id or type'))
                    }
                    normalisedWidgetsAll.set(widget.id, widget)
                }
            }

            // determine which widgets have been added and removed
            const originalGroupsLookup = this.originalGroups || {}
            const currentPageGroups = []
            for (const key in originalGroupsLookup) {
                const originalGroup = originalGroupsLookup[key]
                if (!originalGroup || originalGroup.page !== page) {
                    continue // skip groups that are not on this page
                }
                const pageGroup = this.pageGroups?.find(group => group.id === originalGroup.id)
                if (!pageGroup) {
                    console.warn('Group not found in pageGroups - as we do not currently support adding/removing groups, this should not happen!')
                    throw new Error('Group not found in pageGroups')
                }
                currentPageGroups.push(pageGroup)
            }

            // look for added / removed widgets.
            const originalWidgetsLookup = this.originalWidgets || {}
            // If a widget is in the original list but not in the current list, it has been removed
            for (const key in originalWidgetsLookup) {
                const originalWidget = originalWidgetsLookup[key]
                const widget = normalisedWidgetsAll.get(originalWidget.id)
                if (!currentPageGroups.find(group => group.id === originalWidget?.props?.group)) {
                    continue // skip widgets that are not in a group we are tracking
                }
                if (!widget) {
                    const removeWidget = {
                        __DB2_REMOVE_WIDGET: true,
                        id: originalWidget.id,
                        type: originalWidget.type,
                        ...originalWidget.props
                    }
                    normalisedWidgetsAll.set(removeWidget.id, removeWidget)
                }
            }

            // If a widget is in normalisedWidgets but not in the original list, it has been added
            const normalisedWidgets = Array.from(normalisedWidgetsAll.values()).filter(widget => currentPageGroups.find(group => group.id === widget.group)) || []
            for (const widget of normalisedWidgets) {
                // sanity check - all widgets must belong to a group and that group must be on the page
                if (!widget.group || !currentPageGroups.find(group => group.id === widget.group)) {
                    throw new Error('Widget does not belong to a group on this page')
                }
                const origWidget = originalWidgetsLookup[widget.id]
                if (!origWidget) {
                    widget.__DB2_ADD_WIDGET = true
                }
            }

            if (!normalisedWidgets.length || !currentPageGroups.length) {
                console.warn('No changes to deploy - it should not be possible to get here!')
                return Promise.resolve()
            }

            return NodeRedApi.deployChanges({
                dashboard,
                page,
                groups: currentPageGroups,
                widgets: normalisedWidgets,
                key: editKey.value,
                editorPath: editorPath.value
            })
        }
    }
}
