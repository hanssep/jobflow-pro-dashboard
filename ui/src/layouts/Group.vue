<template>
    <div class="nrdb-layout-group--grid" :style="`grid-template-columns: repeat(min(${ columns }, var(--layout-columns)), 1fr); `">
        <div
            v-if="resizable" ref="group-resize-view" class="nrdb-resizable" :class="{'resizing': groupResizing.active}"
            :style="{ 'width': groupResizing.current.width ? `${groupResizing.current.width}px` : null, 'z-index': 99 }"
        >
            <div
                draggable="true"
                class="nrdb-resizable--handle nrdb-resizable--right"
                @dragstart="onHandleDragStart($event, index, 'group', group, 'top', 'right')"
                @drag="onHandleDrag($event, index, 'group', group, 'top', 'right')"
                @dragover="onHandleOver($event, index, 'group', group, 'top', 'right')"
                @dragend="onHandleDragEnd($event, index, 'group', group, 'top', 'right')"
                @dragenter.prevent
            />
            <!-- Add Spacer button -->
            <div class="nrdb-resizable--toolbar">
                <v-btn v-tooltip:bottom="'Add Spacer'" icon="mdi-card-plus-outline" size="small" variant="text" class="nrdb-resizable--toolbar-button" @click="addSpacer" />
            </div>
        </div>
        <!-- Designer drop zone before first widget -->
        <div
            v-if="designerEnabled && designerDragActive"
            class="designer-group-dropzone"
            @dragover.prevent="onDesignerDragOver($event)"
            @dragleave="designerDropHover = false"
            @drop.prevent="onDesignerDrop($event, 0)"
        >
            <div class="designer-group-dropzone__indicator" :class="{ 'active': designerDropHover }" />
        </div>
        <div
            v-for="(w, $index) in widgets"
            :id="'nrdb-ui-widget-' + w.id"
            :key="w.id"
            :draggable="resizable"
            class="nrdb-ui-widget"
            :class="[getWidgetClass(w), { 'designer-widget-selected': designerEnabled && isWidgetSelected(w.id) }]"
            :style="[{display: 'grid', 'grid-template-columns': 'minmax(0, 1fr)', 'gap': 'var(--widget-gap)', 'position': 'relative'}, widgetStyles(w)]"
            @click.stop="designerEnabled ? onWidgetClick(w) : null"
            @dragstart="!resizable ? null : onWidgetDragStart($event, $index, w)"
            @dragover="!resizable ? null : onWidgetDragOver($event, $index, w)"
            @dragend="!resizable ? null : onWidgetDragEnd($event, $index, w)"
            @dragleave="!resizable ? null : onWidgetDragLeave($event, $index, w)"
            @drop.prevent
            @dragenter.prevent
        >
            <component :is="w.component" :id="w.id" ref="widget-content" :props="w.props" :state="w.state" :style="`grid-row-end: span ${w.props.height}`" />
            <!-- Designer selection outline -->
            <div v-if="designerEnabled && isWidgetSelected(w.id)" class="designer-selection-border">
                <div class="designer-selection-badge">{{ getWidgetTypeLabel(w) }}</div>
                <v-btn
                    v-tooltip:bottom="'Delete Widget (Del)'"
                    class="designer-selection-delete"
                    icon="mdi-delete-outline"
                    size="x-small"
                    variant="flat"
                    color="error"
                    @click.stop="removeWidget(w)"
                />
            </div>
            <div
                v-if="resizable && !groupDragging" ref="widget-resize-view"
                class="nrdb-resizable nrdb-resizable-widget"
                :class="widgetResizing.widgetId === w.id || widgetDragging.widgetId === w.id ? getWidgetEditingClass(w) : null"
                style="z-index: 100; min-width: 28px; min-height: 28px;"
                :style="widgetResizing.widgetId === w.id ? getWidgetEditingStyle(w) : null"
            >
                <!-- Delete Widget button (spacers or designer-enabled) -->
                <div v-if="w.type === 'ui-spacer' || designerEnabled" class="nrdb-resizable--toolbar">
                    <v-btn v-tooltip:bottom="'Delete Widget'" icon="mdi-card-minus-outline" size="small" variant="text" class="nrdb-resizable--toolbar-button" @click="removeWidget(w)" />
                </div>
                <div
                    draggable="true"
                    class="nrdb-resizable--handle nrdb-resizable--right"
                    @dragstart="onHandleDragStart($event, index, 'widget', w, 'ew')"
                    @drag="onHandleDrag($event, index, 'widget', w, 'ew')"
                    @dragover="onHandleOver($event, index, 'widget', w, 'ew')"
                    @dragend="onHandleDragEnd($event, index, 'widget', w, 'ew')"
                    @dragenter.prevent
                    @dblclick="w.props.width = ''; w.layout.width = '3'"
                />
                <div
                    draggable="true"
                    class="nrdb-resizable--handle nrdb-resizable--bottom"
                    @dragstart="onHandleDragStart($event, index, 'widget', w, 'ns')"
                    @drag="onHandleDrag($event, index, 'widget', w, 'ns')"
                    @dragover="onHandleOver($event, index, 'widget', w, 'ns')"
                    @dragend="onHandleDragEnd($event, index, 'widget', w, 'ns')"
                    @dragenter.prevent
                    @dblclick="w.props.height = ''; w.layout.height = '1'"
                />
            </div>
        </div>
        <img ref="blank-img" style="position: absolute;" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt="">
    </div>
</template>

<script>
import WYSIWYG from './wysiwyg/index.js'

function hasNumberProperty (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop) && !isNaN(+obj[prop])
}

export default {
    name: 'WidgetGroup',
    mixins: [WYSIWYG],
    props: {
        group: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        widgets: {
            type: Array,
            required: true
        },
        resizable: {
            type: Boolean,
            default: false
        },
        designerEnabled: {
            type: Boolean,
            default: false
        },
        groupDragging: {
            type: Boolean,
            default: false
        }
    },
    emits: ['resize', 'widget-added', 'widget-removed', 'widget-drop', 'refresh-state-from-store'],
    data () {
        return {
            localWidgets: null,
            designerDropHover: false
        }
    },
    computed: {
        columns () {
            return this.groupResizing.current.columns > 0 ? this.groupResizing.current.columns : +this.group.width
        },
        designerDragActive () {
            return this.$store?.getters['designer/isDragging'] || false
        },
        widgetStyles () {
            return (widget) => {
                const styles = {}
                let height = widget.props.height
                const width = widget.props.width
                if (widget.type === 'ui-form') {
                    // form is unique in that height is defined by the number of fields
                    // so, if the size is set to "auto", we need to set the height/rows to the number of fields, +2 for label and submission buttons
                    if (height === null || height === 0) {
                        height = (widget.props.options.length / (widget.props.splitLayout ? 2 : 1)) + 2
                    }
                }
                styles['grid-row-end'] = `span ${height}`
                styles['grid-template-rows'] = `repeat(${height}, var(--widget-row-height))`
                styles['grid-column-end'] = `span min(${this.getWidgetWidth(+width)}, var(--layout-columns))`
                return styles
            }
        }
    },
    methods: {
        getWidgetClass (widget) {
            const classes = []
            // ensure each widget has a class for its type
            classes.push(`nrdb-${widget.type}`)
            if (widget.props.className) {
                classes.push(widget.props.className)
            }
            if (widget.state.class) {
                classes.push(widget.state.class)
            }
            // hide the widget if required
            if (this.resizable === false && widget.state.visible === false) {
                classes.push('d-none')
            }
            return classes.join(' ')
        },
        getWidgetEditingClass (widget) {
            const classes = []
            // dragging interaction classes
            const dragClass = this.resizable ? this.getWidgetDragDropClass(widget) : null // Mixin method
            if (dragClass) {
                classes.push(dragClass)
            }
            const resizeClass = this.getWidgetResizingClass(widget) // Mixin method
            if (resizeClass) {
                classes.push(resizeClass)
            }
            return classes.join(' ')
        },
        getWidgetEditingStyle (widget) {
            if (!this.widgetResizing.active || this.resizeType !== 'widget') {
                return null
            }
            const style = { }
            if (this.resizeMode === 'ew' && hasNumberProperty(this.widgetResizing.current, 'width')) {
                style.width = `${this.widgetResizing.current.width}px`
            }
            if (this.resizeMode === 'ns' && hasNumberProperty(this.widgetResizing.current, 'height')) {
                style.height = `${this.widgetResizing.current.height}px`
            }
            return style
        },
        getWidgetWidth (width) {
            const w = +width // convert to number if it's a string
            if (!isNaN(w) && w > 0) {
                return Math.min(width, this.columns)
            }
            return this.columns
        },
        addSpacer () {
            if (typeof this.pushUndoSnapshot === 'function') {
                this.pushUndoSnapshot()
            }
            this.$store.dispatch('wysiwyg/addSpacer', {
                group: this.group.id,
                name: 'spacer',
                order: this.widgets.length + 1 || 0,
                height: 1, // consider taking height and width of last widget or last spacer in group?
                width: 1
            }).then((newWidget) => {
                console.log('New Widget:', newWidget)
                this.$emit('widget-added', { widget: newWidget, group: this.group })
            }).catch((error) => {
                console.error('Error adding spacer:', error)
            })
        },
        removeWidget (widget) {
            if (typeof this.pushUndoSnapshot === 'function') {
                this.pushUndoSnapshot()
            }
            // Clear selection if removing selected widget
            if (this.designerEnabled && this.isWidgetSelected(widget.id)) {
                this.$store.dispatch('designer/clearSelection')
            }
            this.$store.dispatch('wysiwyg/removeWidget', { id: widget.id }).then(() => {
                console.log('Widget removed')
                this.$emit('widget-removed', { widget })
            }).catch((error) => {
                console.error('Error deleting widget:', error)
            })
        },
        // Designer methods
        isWidgetSelected (widgetId) {
            return this.$store?.getters['designer/selectedWidgetId'] === widgetId
        },
        onWidgetClick (widget) {
            this.$store.dispatch('designer/selectWidget', { id: widget.id, widgetType: widget.type })
        },
        getWidgetTypeLabel (widget) {
            const typeInfo = this.$store?.getters['widgetTypes/getType']?.(widget.type)
            return typeInfo?.label || widget.type
        },
        onDesignerDragOver (event) {
            event.dataTransfer.dropEffect = 'copy'
            this.designerDropHover = true
        },
        onDesignerDrop (event, index) {
            this.designerDropHover = false
            try {
                const data = JSON.parse(event.dataTransfer.getData('application/x-designer-widget'))
                if (data && data.source === 'palette' && data.widgetType) {
                    this.$emit('widget-drop', {
                        widgetType: data.widgetType,
                        groupId: this.group.id,
                        index
                    })
                }
            } catch (e) {
                // Not a valid designer drag
            }
        }
    }
}
</script>

<style scoped lang="scss">
@use './wysiwyg/resizable.scss' as *;

/* Designer widget selection */
.designer-widget-selected {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 1px;
    border-radius: 2px;
}
.designer-selection-border {
    position: absolute;
    inset: -2px;
    pointer-events: none;
    z-index: 50;
}
.designer-selection-badge {
    position: absolute;
    bottom: -2px;
    left: 4px;
    transform: translateY(100%);
    font-size: 0.625rem;
    padding: 1px 6px;
    border-radius: 2px;
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    white-space: nowrap;
}
.designer-selection-delete {
    position: absolute;
    top: -4px;
    right: -4px;
    transform: translateY(-100%);
    pointer-events: auto;
    z-index: 51;
}

/* Designer drop zone */
.designer-group-dropzone {
    grid-column: 1 / -1;
    padding: 2px 4px;
}
.designer-group-dropzone__indicator {
    height: 32px;
    border: 2px dashed rgba(var(--v-theme-primary), 0.3);
    border-radius: 4px;
    background-color: rgba(var(--v-theme-primary), 0.03);
    transition: all 0.15s ease;
}
.designer-group-dropzone__indicator.active {
    height: 48px;
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
