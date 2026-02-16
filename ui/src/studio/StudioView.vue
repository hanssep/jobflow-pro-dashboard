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
            @create-page="createPage"
            @go-back="goBack"
            @back-to-pages="backToPages"
            @save="saveEdits"
            @discard="discardEdits"
            @undo="undoEdit"
            @redo="redoEdit"
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
            />

            <!-- Editing mode: canvas + property panel -->
            <div v-else-if="mode === 'editing'" class="studio-editor">
                <div class="studio-editor__canvas">
                    <StudioCanvas
                        ref="canvas"
                        :page-id="activePageId"
                        :dashboard-id="dashboardId"
                        :editor-path="editorPath"
                        @save="saveEdits"
                        @leave="backToPages"
                        @state-changed="onCanvasStateChanged"
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
            <v-card>
                <v-card-title>Delete Page</v-card-title>
                <v-card-text>
                    Are you sure you want to delete this page? This will also remove all groups and widgets on this page. This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="deleteDialog.show = false">Cancel</v-btn>
                    <v-btn color="error" variant="flat" :loading="deleteDialog.loading" @click="doDeletePage">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Confirm Discard Dialog -->
        <v-dialog v-model="confirmLeaveDialog.show" max-width="420" persistent>
            <v-card>
                <v-card-title>Unsaved Changes</v-card-title>
                <v-card-text>
                    There are unsaved changes that will be discarded. Are you sure you want to leave?
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="confirmLeaveDialog.show = false">Cancel</v-btn>
                    <v-btn color="error" variant="flat" @click="confirmLeaveAndExit">Discard &amp; Leave</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Save Confirmation Dialog -->
        <v-dialog v-model="saveDialog.show" max-width="420" persistent>
            <v-card>
                <v-card-title>Save Changes</v-card-title>
                <v-card-text>
                    This will deploy your changes to the Node-RED runtime. Are you sure?
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="saveDialog.show = false">Cancel</v-btn>
                    <v-btn color="primary" variant="flat" :loading="editState.saving" @click="doSave">Save</v-btn>
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
            // Delete / Backspace → delete widget
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selection = this.$store.getters['designer/selection']
                if (selection && selection.type === 'widget') {
                    e.preventDefault()
                    this.deleteSelectedWidget(selection)
                }
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
        onCanvasStateChanged ({ dirty }) {
            this.editState.dirty = dirty
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
    background-color: #f5f5f5;
    min-height: 100vh;
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
    background-color: rgb(var(--v-theme-surface));
    border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
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
</style>
