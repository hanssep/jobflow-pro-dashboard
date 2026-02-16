<template>
    <div
        class="studio-canvas"
        @click.self="clearSelection"
        @wheel.ctrl.prevent="onCtrlWheel"
        @wheel.meta.prevent="onCtrlWheel"
    >
        <div class="studio-canvas__body" @click.self="clearSelection">
            <div
                class="studio-canvas__viewport"
                :style="viewportStyle"
                @click.self="clearSelection"
            >
                <div
                    v-if="gridOverlay"
                    class="studio-canvas__grid-overlay"
                    :style="{ '--layout-columns': columns }"
                >
                    <div v-for="n in columns" :key="n" class="studio-canvas__grid-col" />
                </div>
                <div
                    v-if="orderedGroups.length"
                    class="studio-canvas__grid nrdb-layout--grid nrdb-ui-page"
                    :style="{ '--layout-columns': columns }"
                    @click.self="clearSelection"
                >
                <div
                    v-for="(g, $index) in orderedGroups"
                    :id="'nrdb-ui-group-' + g.id"
                    :key="g.id"
                    class="nrdb-ui-group"
                    :class="getGroupClass(g)"
                    :style="`grid-column-end: span min(${ g.width }, var(--layout-columns))`"
                    :draggable="true"
                    @dragstart="onGroupDragStart($event, $index, g)"
                    @dragover="onGroupDragOver($event, $index, g)"
                    @dragend="onGroupDragEnd($event, $index, g)"
                    @dragleave="onGroupDragLeave($event, $index, g)"
                    @drop.prevent
                    @dragenter.prevent
                >
                    <v-card variant="outlined" class="bg-group-background">
                        <template v-if="g.showTitle" #title>
                            {{ g.name }}
                        </template>
                        <template #text>
                            <widget-group
                                :group="g"
                                :index="$index"
                                :widgets="groupWidgets(g.id)"
                                :resizable="true"
                                :designer-enabled="true"
                                :group-dragging="groupDragging.active"
                                @resize="onGroupResize"
                                @widget-added="updateEditStateObjects"
                                @widget-removed="updateEditStateObjects"
                                @widget-drop="onWidgetDrop"
                                @refresh-state-from-store="updateEditStateObjects"
                            />
                        </template>
                    </v-card>
                </div>
            </div>
                <div v-else class="studio-canvas__empty">
                    <v-icon size="64" color="grey-lighten-1">mdi-view-grid-plus-outline</v-icon>
                    <p class="text-body-2 text-medium-emphasis mt-3">This page has no groups or widgets yet.</p>
                    <p class="text-caption text-medium-emphasis">Add widgets in the Node-RED editor.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { useDesignerState } from '../designer/composables/useDesignerState.js'
import { fetchWidgetTypes } from '../designer/services/WidgetTypeService.js'
import WidgetGroup from '../layouts/Group.vue'
import WYSIWYG from '../layouts/wysiwyg/index.js'

export default {
    name: 'StudioCanvas',
    components: { WidgetGroup },
    mixins: [WYSIWYG],
    props: {
        pageId: { type: String, required: true },
        dashboardId: { type: String, default: '' },
        editorPath: { type: String, default: '' },
        previewWidth: { type: Number, default: 0 },
        zoom: { type: Number, default: 1 },
        gridOverlay: { type: Boolean, default: false }
    },
    emits: ['save', 'leave', 'state-changed', 'update:columns'],
    setup () {
        const {
            selection, clearSelection, enable, disable,
            selectWidget, isPropertiesVisible, toggleProperties
        } = useDesignerState()

        return {
            selection, clearSelection, enable, disable,
            selectWidget, isPropertiesVisible, toggleProperties
        }
    },
    data () {
        return {
            columns: 12,
            saving: false,
            pageGroups: [],
            pageGroupWidgets: {}
        }
    },
    computed: {
        ...mapState('ui', ['groups', 'widgets', 'pages']),
        ...mapGetters('ui', ['groupsByPage', 'widgetsByGroup']),
        ...mapGetters('wysiwyg', ['isDirty', 'originalGroups', 'originalWidgets', 'canUndo']),
        page () {
            return this.pages[this.pageId]
        },
        editMode () {
            // Always in edit mode when canvas is mounted
            return true
        },
        dirty () {
            return this.isDirty(this.pageId, this.pageGroups, this.pageGroupWidgets)
        },
        orderedGroups () {
            return this.pageGroups
        },
        groupWidgets () {
            return (groupId) => this.pageGroupWidgets[groupId] || []
        },
        viewportStyle () {
            const styles = {}
            if (this.previewWidth > 0) {
                styles.maxWidth = this.previewWidth + 'px'
                styles.margin = '0 auto'
            }
            if (this.zoom !== 1) {
                styles.transform = `scale(${this.zoom})`
                styles.transformOrigin = 'top center'
            }
            return styles
        }
    },
    watch: {
        dirty (val) {
            this.$emit('state-changed', { dirty: val })
        },
        previewWidth () {
            this.countColumns()
        },
        columns (val) {
            this.$emit('update:columns', val)
        }
    },
    mounted () {
        // Override mixin keyboard binding — StudioView handles all shortcuts
        this._unbindKeyboard()

        this.enable()
        this.countColumns()
        this._resizeHandler = () => this.countColumns()
        window.addEventListener('resize', this._resizeHandler)
        this.updateEditStateObjects()
        this.initializeEditTracking()
        if (this.dashboardId) {
            fetchWidgetTypes(this.$store, this.dashboardId, this.editorPath).catch(err => {
                console.error('[StudioCanvas] Failed to load widget types:', err)
            })
        }
    },
    beforeUnmount () {
        this.disable()
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler)
        }
    },
    methods: {
        countColumns () {
            let cols = 12
            if (this.page) {
                let b = this.page.breakpoints
                if (!b || !Array.isArray(b) || b.length === 0) {
                    b = [
                        { name: 'Default', px: 0, cols: 3 },
                        { name: 'Tablet', px: 576, cols: 6 },
                        { name: 'Small Desktop', px: 768, cols: 9 },
                        { name: 'Desktop', px: 1024, cols: 12 }
                    ]
                }
                const referenceWidth = this.previewWidth > 0 ? this.previewWidth : window.innerWidth
                const breakpoints = b.sort((a, b) => a.px - b.px)
                breakpoints.forEach((bp) => {
                    if (referenceWidth >= bp.px) {
                        cols = Number(bp.cols)
                    }
                })
            }
            this.columns = cols
        },
        getPageGroups () {
            return this.groupsByPage(this.pageId)
                .filter((g) => {
                    if ('visible' in g) {
                        return g.visible && g.groupType !== 'dialog'
                    }
                    return g.groupType !== 'dialog'
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
        },
        getGroupWidgets (groupId) {
            return this.widgetsByGroup(groupId)
                .filter((w) => {
                    if ('visible' in w) return w.visible
                    return true
                })
                .sort((a, b) => (a?.layout?.order || 0) - (b?.layout?.order || 0))
        },
        getGroupClass (group) {
            const classes = []
            if (group.className) classes.push(group.className)
            const dragDropClass = this.getGroupDragDropClass(group)
            if (dragDropClass) classes.push(dragDropClass)
            return classes.join(' ')
        },
        updateEditStateObjects () {
            this.pageGroups = this.getPageGroups()
            const pageGroupWidgets = {}
            for (const group of this.pageGroups) {
                pageGroupWidgets[group.id] = this.getGroupWidgets(group.id)
            }
            this.pageGroupWidgets = pageGroupWidgets
        },
        onGroupResize (opts) {
            if (typeof opts.width !== 'number' || opts.width < 1) return
            this.pageGroups[opts.index].width = opts.width
        },
        onWidgetDrop ({ widgetType, groupId, index }) {
            this.pushUndoSnapshot()
            const defaults = this.$store.getters['widgetTypes/getType'](widgetType)
            const defValues = {}
            if (defaults?.defaults) {
                for (const [key, config] of Object.entries(defaults.defaults)) {
                    defValues[key] = config.value
                }
            }
            this.$store.dispatch('wysiwyg/addWidget', {
                type: widgetType,
                group: groupId,
                name: defValues.name || widgetType.replace('ui-', ''),
                order: index,
                height: defValues.height || 1,
                width: defValues.width || 3,
                props: defValues
            }).then((newWidget) => {
                this.$store.dispatch('designer/selectWidget', { id: newWidget.id, widgetType })
                this.updateEditStateObjects()
            }).catch((error) => {
                console.error('Error adding widget:', error)
            })
        },
        onCtrlWheel (e) {
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            this.$emit('state-changed', { zoomDelta: delta })
        },
        // Public methods called by parent
        doSave () {
            return this.deployChanges({
                dashboard: this.page.ui,
                page: this.page.id,
                groups: this.pageGroups,
                widgets: this.pageGroupWidgets
            }).then(() => {
                this.acceptChanges()
            })
        },
        doDiscard () {
            this.revertEdits()
            this.updateEditStateObjects()
        },
        doUndo () {
            this.$store.dispatch('wysiwyg/popUndoSnapshot').then((restored) => {
                if (restored) {
                    this.updateEditStateObjects()
                }
            })
        },
        doRedo () {
            this.$store.dispatch('wysiwyg/redo').then((restored) => {
                if (restored) {
                    this.updateEditStateObjects()
                }
            })
        },
        doExit () {
            this.$store.dispatch('wysiwyg/endEditTracking')
            this.disable()
        }
    }
}
</script>

<style scoped>
@import "../layouts/grid-groups.css";

.studio-canvas {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.studio-canvas__body {
    flex: 1;
    overflow: auto;
    background-color: #f3f4f6;
    padding: 0;
    /* Subtle cross-hatch pattern for canvas feel */
    background-image:
        radial-gradient(circle, #ddd 0.5px, transparent 0.5px);
    background-size: 24px 24px;
}
.studio-canvas__viewport {
    transition: max-width 0.3s ease;
    min-height: 100%;
    position: relative;
}
.studio-canvas__grid-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(var(--layout-columns), 1fr);
    gap: var(--group-gap, 12px);
    padding: var(--page-padding, 12px);
    pointer-events: none;
    z-index: 1;
}
.studio-canvas__grid-col {
    background: rgba(58, 115, 176, 0.05);
    border: 1px dashed rgba(58, 115, 176, 0.2);
    border-radius: 2px;
    min-height: 100%;
}
.studio-canvas__grid {
    --layout-card-width: 320px;
    --layout-gap: 12px;
    display: grid;
    grid-template-columns: repeat(var(--layout-columns), 1fr);
    flex-wrap: wrap;
    padding: var(--page-padding, 12px);
    gap: var(--group-gap, 12px);
}
.studio-canvas__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    padding: 60px 20px;
    background: none;
}
.studio-canvas__empty p {
    font-family: 'Exo 2', sans-serif;
}
.v-card {
    width: 100%;
}
</style>
