<template>
    <div class="studio-canvas" @click.self="clearSelection">
        <div class="studio-canvas__body" @click.self="clearSelection">
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
        editorPath: { type: String, default: '' }
    },
    emits: ['save', 'leave', 'state-changed'],
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
        }
    },
    watch: {
        dirty (val) {
            this.$emit('state-changed', { dirty: val })
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
                const breakpoints = b.sort((a, b) => a.px - b.px)
                breakpoints.forEach((bp) => {
                    if (window.innerWidth >= bp.px) {
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
        // Public methods called by parent
        doSave () {
            console.log('[StudioCanvas] doSave — page:', this.page?.id, 'dashboard:', this.page?.ui)
            console.log('[StudioCanvas] doSave — groups:', this.pageGroups?.length, 'widgetGroups:', Object.keys(this.pageGroupWidgets || {}))
            console.log('[StudioCanvas] doSave — originalGroups:', this.originalGroups, 'originalWidgets:', this.originalWidgets)
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
}
.studio-canvas__body {
    flex: 1;
    overflow: auto;
    background-color: #f5f5f5;
    padding: 0;
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
}
.v-card {
    width: 100%;
}
</style>
