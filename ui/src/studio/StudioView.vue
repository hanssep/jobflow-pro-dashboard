<template>
    <v-app>
        <StudioToolbar
            :mode="mode"
            :creating="creating"
            :page-name="activePageName"
            :dirty="editState.dirty"
            :saving="editState.saving"
            :can-undo="canUndo"
            :can-redo="canRedo"
            :preview-breakpoint="previewBreakpoint"
            :zoom="zoom"
            :column-count="columnCount"
            :grid-overlay="gridOverlay"
            @create-page="createPage"
            @go-back="goBack"
            @back-to-pages="backToPages"
            @save="saveEdits"
            @discard="discardEdits"
            @undo="undoEdit"
            @redo="redoEdit"
            @update:preview-breakpoint="setPreviewBreakpoint"
            @zoom-in="zoomIn"
            @zoom-out="zoomOut"
            @zoom-reset="zoomReset"
            @zoom-fit="zoomFit"
            @toggle-grid-overlay="gridOverlay = !gridOverlay"
        />
        <v-main class="studio-main">
            <!-- Pages mode: grid of page cards -->
            <PageGrid
                v-if="mode === 'pages'"
                :pages="pages"
                :groups="groups"
                :widgets="widgets"
                :creating-page-id="creatingPageId"
                :dashboard-id="dashboardId"
                @open-page="openPageEditor"
                @rename-page="renamePage"
                @delete-page="confirmDeletePage"
                @start-rename="startRename"
                @reorder-pages="reorderPages"
            />

            <!-- Editing mode: canvas + property panel -->
            <div v-else-if="mode === 'editing'" class="studio-editor">
                <div class="studio-editor__canvas">
                    <StudioCanvas
                        ref="canvas"
                        :page-id="activePageId"
                        :dashboard-id="dashboardId"
                        :editor-path="editorPath"
                        :preview-width="previewWidth"
                        :zoom="zoom"
                        :grid-overlay="gridOverlay"
                        @save="saveEdits"
                        @leave="backToPages"
                        @state-changed="onCanvasStateChanged"
                        @update:columns="columnCount = $event"
                    />
                </div>
                <transition name="slide-right">
                    <div v-if="isPropertiesVisible" class="studio-editor__properties">
                        <PropertyEditor />
                    </div>
                </transition>
            </div>
        </v-main>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog.show" max-width="420" persistent>
            <v-card class="studio-dialog">
                <v-card-title class="studio-dialog__title">Delete Page</v-card-title>
                <v-card-text class="studio-dialog__text">
                    Are you sure you want to delete this page? This will also remove all groups and widgets on this page. This action cannot be undone.
                </v-card-text>
                <v-card-actions class="studio-dialog__actions">
                    <v-spacer />
                    <v-btn variant="text" class="studio-dialog__btn" @click="deleteDialog.show = false">Cancel</v-btn>
                    <v-btn variant="flat" class="studio-dialog__btn-danger" :loading="deleteDialog.loading" @click="doDeletePage">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Confirm Discard Dialog -->
        <v-dialog v-model="confirmLeaveDialog.show" max-width="420" persistent>
            <v-card class="studio-dialog">
                <v-card-title class="studio-dialog__title">Unsaved Changes</v-card-title>
                <v-card-text class="studio-dialog__text">
                    There are unsaved changes that will be discarded. Are you sure you want to leave?
                </v-card-text>
                <v-card-actions class="studio-dialog__actions">
                    <v-spacer />
                    <v-btn variant="text" class="studio-dialog__btn" @click="confirmLeaveDialog.show = false">Cancel</v-btn>
                    <v-btn variant="flat" class="studio-dialog__btn-danger" @click="confirmLeaveAndExit">Discard &amp; Leave</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Save Confirmation Dialog -->
        <v-dialog v-model="saveDialog.show" max-width="420" persistent>
            <v-card class="studio-dialog">
                <v-card-title class="studio-dialog__title">Save Changes</v-card-title>
                <v-card-text class="studio-dialog__text">
                    This will deploy your changes to the Node-RED runtime. Are you sure?
                </v-card-text>
                <v-card-actions class="studio-dialog__actions">
                    <v-spacer />
                    <v-btn variant="text" class="studio-dialog__btn" @click="saveDialog.show = false">Cancel</v-btn>
                    <v-btn variant="flat" class="studio-dialog__btn-primary" :loading="editState.saving" @click="doSave">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar for errors -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
        </v-snackbar>
    </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { useDesignerState } from '../designer/composables/useDesignerState.js'
import PropertyEditor from '../designer/panels/PropertyEditor.vue'
import { initialise as initEditMode } from '../EditTracking.js'

import PageGrid from './PageGrid.vue'
import StudioCanvas from './StudioCanvas.vue'
import StudioToolbar from './StudioToolbar.vue'
import StudioApi from './composables/useStudioApi.js'

export default {
    name: 'StudioView',
    components: { StudioToolbar, PageGrid, StudioCanvas, PropertyEditor },
    setup () {
        const { isPropertiesVisible } = useDesignerState()
        return { isPropertiesVisible }
    },
    data () {
        return {
            activePageId: null,
            creating: false,
            editState: {
                dirty: false,
                saving: false
            },
            previewBreakpoint: 'auto',
            zoom: 1,
            columnCount: 12,
            gridOverlay: false,
            deleteDialog: {
                show: false,
                pageId: null,
                loading: false
            },
            confirmLeaveDialog: {
                show: false
            },
            saveDialog: {
                show: false
            },
            snackbar: {
                show: false,
                text: '',
                color: 'error'
            }
        }
    },
    computed: {
        ...mapState('ui', ['pages', 'groups', 'widgets', 'dashboards']),
        ...mapGetters('wysiwyg', ['canUndo']),
        mode () {
            return this.activePageId ? 'editing' : 'pages'
        },
        dashboardId () {
            return this.$route.meta?.dashboard || ''
        },
        editorPath () {
            return this.$store.state.setup?.setup?.RED?.httpAdminRoot || ''
        },
        creatingPageId () {
            return this.$store.state.studio.creatingPageId
        },
        activePageName () {
            if (!this.activePageId || !this.pages) return ''
            return this.pages[this.activePageId]?.name || ''
        },
        canRedo () {
            return this.$store.state.wysiwyg.redoStack?.length > 0
        },
        previewWidth () {
            const widths = { desktop: 1920, laptop: 1280, tablet: 768, mobile: 375 }
            return widths[this.previewBreakpoint] || 0
        }
    },
    mounted () {
        this._keydownHandler = (e) => {
            if (this.mode !== 'editing') return

            // Ctrl+S → save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (this.editState.dirty && !this.editState.saving) {
                    this.saveEdits()
                }
            }
            // Ctrl+Z → undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                this.undoEdit()
            }
            // Ctrl+Shift+Z → redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault()
                this.redoEdit()
            }
            // Ctrl+D → duplicate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault()
                this.duplicateWidget()
            }
            // Ctrl+C → copy
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                this.copyWidget()
            }
            // Ctrl+V → paste
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                this.pasteWidget()
            }
            // Ctrl+A → select all widgets in current page
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault()
                this.selectAllWidgets()
            }
            // Delete / Backspace → delete widget(s)
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const multi = this.$store.getters['designer/multiSelection']
                if (multi && multi.length > 1) {
                    e.preventDefault()
                    this.deleteMultipleWidgets(multi)
                } else {
                    const selection = this.$store.getters['designer/selection']
                    if (selection && selection.type === 'widget') {
                        e.preventDefault()
                        this.deleteSelectedWidget(selection)
                    }
                }
            }
            // Tab / Shift+Tab → cycle widget selection
            if (e.key === 'Tab') {
                e.preventDefault()
                this.cycleSelection(e.shiftKey ? -1 : 1)
            }
            // Arrow Up/Down → nudge widget order
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                const selection = this.$store.getters['designer/selection']
                if (selection && selection.type === 'widget') {
                    e.preventDefault()
                    this.nudgeWidgetOrder(selection.id, e.key === 'ArrowUp' ? -1 : 1)
                }
            }
            // Ctrl+0 → fit to view
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault()
                this.zoomFit()
            }
            // Ctrl+1 → zoom to 100%
            if ((e.ctrlKey || e.metaKey) && e.key === '1') {
                e.preventDefault()
                this.zoomReset()
            }
            // Escape → deselect or leave
            if (e.key === 'Escape') {
                e.preventDefault()
                const selection = this.$store.getters['designer/selection']
                if (selection) {
                    this.$store.dispatch('designer/clearSelection')
                } else {
                    this.backToPages()
                }
            }
        }
        window.addEventListener('keydown', this._keydownHandler)
    },
    beforeUnmount () {
        if (this._keydownHandler) {
            window.removeEventListener('keydown', this._keydownHandler)
        }
    },
    methods: {
        async openPageEditor (pageId) {
            try {
                const response = await StudioApi.startEditPage({
                    dashboard: this.dashboardId,
                    pageId,
                    editorPath: this.editorPath
                })
                const data = response.data
                // Initialize edit tracking with the edit key from the server
                if (data.editKey) {
                    initEditMode(data.editKey, pageId, this.editorPath)
                }
                this.activePageId = pageId
            } catch (err) {
                this.showError('Failed to open page: ' + (err.response?.data?.error || err.message))
            }
        },
        backToPages () {
            if (this.editState.dirty) {
                this.confirmLeaveDialog.show = true
                return
            }
            this.exitEditor()
        },
        confirmLeaveAndExit () {
            this.confirmLeaveDialog.show = false
            if (this.$refs.canvas) {
                this.$refs.canvas.doDiscard()
                this.$refs.canvas.doExit()
            }
            this.activePageId = null
            this.editState.dirty = false
        },
        exitEditor () {
            if (this.$refs.canvas) {
                this.$refs.canvas.doExit()
            }
            this.activePageId = null
            this.editState.dirty = false
        },
        saveEdits () {
            if (!this.editState.dirty) return
            this.saveDialog.show = true
        },
        async doSave () {
            this.editState.saving = true
            this.saveDialog.show = false
            try {
                await this.$refs.canvas.doSave()
                this.editState.dirty = false
            } catch (error) {
                const serverMsg = error.response?.data?.error || error.response?.data?.message
                const detail = serverMsg || error.message || 'Unknown error'
                console.error('[Studio] Save failed:', detail, error.response?.data || error)
                this.showError('Failed to save: ' + detail)
            } finally {
                this.editState.saving = false
            }
        },
        discardEdits () {
            if (this.$refs.canvas) {
                this.$refs.canvas.doDiscard()
                this.editState.dirty = false
            }
        },
        undoEdit () {
            if (this.$refs.canvas) {
                this.$refs.canvas.doUndo()
            }
        },
        redoEdit () {
            if (this.$refs.canvas) {
                this.$refs.canvas.doRedo()
            }
        },
        onCanvasStateChanged (payload) {
            if ('dirty' in payload) {
                this.editState.dirty = payload.dirty
            }
            if ('zoomDelta' in payload) {
                this.setZoom(this.zoom + payload.zoomDelta)
            }
        },
        // Breakpoint & zoom
        setPreviewBreakpoint (bp) {
            this.previewBreakpoint = bp
        },
        setZoom (level) {
            this.zoom = Math.round(Math.min(2, Math.max(0.25, level)) * 100) / 100
        },
        zoomIn () {
            this.setZoom(this.zoom + 0.1)
        },
        zoomOut () {
            this.setZoom(this.zoom - 0.1)
        },
        zoomReset () {
            this.zoom = 1
        },
        zoomFit () {
            // Estimate: fit preview width into canvas container
            const canvasEl = this.$refs.canvas?.$el
            if (!canvasEl) { this.zoom = 1; return }
            const containerWidth = canvasEl.clientWidth
            const contentWidth = this.previewWidth || containerWidth
            if (contentWidth <= 0) { this.zoom = 1; return }
            this.setZoom(containerWidth / contentWidth)
        },
        cycleSelection (direction) {
            const widgets = this.$store.state.ui.widgets
            const groups = this.$store.state.ui.groups
            if (!widgets || !groups) return
            const pageGroupIds = new Set(
                Object.values(groups)
                    .filter(g => g.page === this.activePageId)
                    .map(g => g.id)
            )
            const pageWidgets = Object.values(widgets)
                .filter(w => pageGroupIds.has(w.props?.group))
                .sort((a, b) => (a.layout?.order || 0) - (b.layout?.order || 0))
            if (!pageWidgets.length) return
            const current = this.$store.getters['designer/selection']
            let idx = current ? pageWidgets.findIndex(w => w.id === current.id) : -1
            idx = (idx + direction + pageWidgets.length) % pageWidgets.length
            const w = pageWidgets[idx]
            this.$store.dispatch('designer/selectWidget', { id: w.id, widgetType: w.type })
        },
        nudgeWidgetOrder (widgetId, direction) {
            const widget = this.$store.state.ui.widgets[widgetId]
            if (!widget) return
            const groupId = widget.props?.group
            if (!groupId) return
            const siblings = Object.values(this.$store.state.ui.widgets)
                .filter(w => w.props?.group === groupId)
                .sort((a, b) => (a.layout?.order || 0) - (b.layout?.order || 0))
            const idx = siblings.findIndex(w => w.id === widgetId)
            const swapIdx = idx + direction
            if (swapIdx < 0 || swapIdx >= siblings.length) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            const orderA = siblings[idx].layout?.order || idx
            const orderB = siblings[swapIdx].layout?.order || swapIdx
            this.$store.dispatch('wysiwyg/updateWidgetProperty', {
                id: widgetId,
                key: 'order',
                value: orderB
            })
            this.$store.dispatch('wysiwyg/updateWidgetProperty', {
                id: siblings[swapIdx].id,
                key: 'order',
                value: orderA
            })
            if (this.$refs.canvas) {
                this.$refs.canvas.updateEditStateObjects()
            }
        },
        selectAllWidgets () {
            const widgets = this.$store.state.ui.widgets
            if (!widgets) return
            // Get all widgets on the active page (via groups)
            const groups = this.$store.state.ui.groups
            const pageGroupIds = new Set(
                Object.values(groups || {})
                    .filter(g => g.page === this.activePageId)
                    .map(g => g.id)
            )
            const items = Object.values(widgets)
                .filter(w => pageGroupIds.has(w.props?.group))
                .map(w => ({ type: 'widget', id: w.id, widgetType: w.type }))
            this.$store.dispatch('designer/selectAll', items)
        },
        deleteMultipleWidgets (items) {
            const widgetItems = items.filter(i => i.type === 'widget')
            if (!widgetItems.length) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('designer/clearSelection')
            const promises = widgetItems.map(i =>
                this.$store.dispatch('wysiwyg/removeWidget', { id: i.id })
            )
            Promise.all(promises).then(() => {
                if (this.$refs.canvas) {
                    this.$refs.canvas.updateEditStateObjects()
                }
            })
        },
        // Delete widget
        deleteSelectedWidget (selection) {
            if (!selection || selection.type !== 'widget') return
            const widget = this.$store.state.ui.widgets[selection.id]
            if (!widget) return
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('designer/clearSelection')
            this.$store.dispatch('wysiwyg/removeWidget', { id: selection.id }).then(() => {
                if (this.$refs.canvas) {
                    this.$refs.canvas.updateEditStateObjects()
                }
            })
        },
        // Copy/Paste/Duplicate
        copyWidget () {
            const selection = this.$store.getters['designer/selection']
            if (!selection || selection.type !== 'widget') return
            const widget = this.$store.state.ui.widgets[selection.id]
            if (!widget) return
            this.$store.commit('designer/SET_CLIPBOARD', {
                type: 'widget',
                data: {
                    widgetType: widget.type,
                    props: { ...widget.props },
                    layout: { ...widget.layout }
                }
            })
        },
        pasteWidget () {
            const clipboard = this.$store.state.designer.clipboard
            if (!clipboard || clipboard.type !== 'widget') return
            const data = clipboard.data
            this.$store.dispatch('wysiwyg/pushUndoSnapshot')
            this.$store.dispatch('wysiwyg/addWidget', {
                type: data.widgetType,
                group: data.props.group,
                name: data.props.name + ' copy',
                order: (data.props.order || 0) + 1,
                height: data.layout.height || 1,
                width: data.layout.width || 3,
                props: { ...data.props }
            }).then((newWidget) => {
                this.$store.dispatch('designer/selectWidget', { id: newWidget.id, widgetType: data.widgetType })
                if (this.$refs.canvas) {
                    this.$refs.canvas.updateEditStateObjects()
                }
            })
        },
        duplicateWidget () {
            this.copyWidget()
            this.pasteWidget()
        },

        // Page management methods
        async createPage () {
            if (this.creating) return
            this.creating = true
            try {
                const response = await StudioApi.createPage({
                    dashboard: this.dashboardId,
                    editorPath: this.editorPath
                })
                if (response.data?.page?.id) {
                    this.$store.commit('studio/setCreatingPageId', response.data.page.id)
                }
            } catch (err) {
                this.showError('Failed to create page: ' + (err.response?.data?.error || err.message))
            } finally {
                this.creating = false
            }
        },
        async renamePage (pageId, newName) {
            this.$store.commit('studio/clearCreatingPageId')
            if (!newName) return
            try {
                await StudioApi.renamePage({
                    dashboard: this.dashboardId,
                    pageId,
                    name: newName,
                    editorPath: this.editorPath
                })
            } catch (err) {
                this.showError('Failed to rename page: ' + (err.response?.data?.error || err.message))
            }
        },
        startRename (pageId) {
            this.$store.commit('studio/setCreatingPageId', pageId)
        },
        confirmDeletePage (pageId) {
            this.deleteDialog = { show: true, pageId, loading: false }
        },
        async doDeletePage () {
            this.deleteDialog.loading = true
            try {
                await StudioApi.deletePage({
                    dashboard: this.dashboardId,
                    pageId: this.deleteDialog.pageId,
                    editorPath: this.editorPath
                })
                this.deleteDialog.show = false
            } catch (err) {
                this.showError('Failed to delete page: ' + (err.response?.data?.error || err.message))
            } finally {
                this.deleteDialog.loading = false
            }
        },
        async reorderPages (pageIds) {
            try {
                await StudioApi.reorderPages({
                    dashboard: this.dashboardId,
                    order: pageIds,
                    editorPath: this.editorPath
                })
            } catch (err) {
                this.showError('Failed to reorder pages: ' + (err.response?.data?.error || err.message))
            }
        },
        goBack () {
            if (this.mode === 'editing') {
                this.backToPages()
                return
            }
            const dashboard = this.dashboards?.[this.dashboardId]
            if (dashboard) {
                const path = (dashboard.path || '/').replace(/\/\//g, '/')
                this.$router.push(path)
            } else {
                this.$router.push('/')
            }
        },
        showError (text) {
            this.snackbar = { show: true, text, color: 'error' }
        }
    }
}
</script>

<style scoped>
.studio-main {
    background-color: #f3f4f6;
    min-height: 100vh;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Editor layout: canvas + property panel */
.studio-editor {
    display: flex;
    height: calc(100vh - 48px);
    overflow: hidden;
}
.studio-editor__canvas {
    flex: 1;
    min-width: 0;
    overflow: auto;
}
.studio-editor__properties {
    width: 300px;
    min-width: 300px;
    overflow-y: auto;
    background-color: #ffffff;
    border-left: 1px solid #dee2e6;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
}

/* Panel slide transitions */
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
    width: 0;
    min-width: 0;
}

/* Dialog styles — fiery-lab design */
.studio-dialog {
    border-radius: 8px !important;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #ccc !important;
}
.studio-dialog__title {
    font-family: 'Exo 2', sans-serif;
    font-size: 16px !important;
    font-weight: 600;
    color: #333;
    padding: 20px 20px 8px !important;
}
.studio-dialog__text {
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    padding: 8px 20px 16px !important;
}
.studio-dialog__actions {
    padding: 8px 16px 16px !important;
}
.studio-dialog__btn {
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-transform: none;
}
.studio-dialog__btn-primary {
    background-color: #5a8f00 !important;
    color: white !important;
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
}
.studio-dialog__btn-primary:hover {
    background-color: #4a7a00 !important;
}
.studio-dialog__btn-danger {
    background-color: #8f0000 !important;
    color: white !important;
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
}
.studio-dialog__btn-danger:hover {
    background-color: #6e0000 !important;
}
</style>
