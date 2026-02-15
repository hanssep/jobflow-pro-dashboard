<template>
    <div
        class="designer-widget"
        :class="{ 'designer-widget--selected': isSelected }"
        style="position: relative;"
        @click.stop="onSelect"
    >
        <slot />
        <SelectionOutline
            :is-selected="isSelected"
            :type-label="typeLabel"
            @delete="onDelete"
        />
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

import SelectionOutline from './SelectionOutline.vue'

export default {
    name: 'DesignerWidget',
    components: { SelectionOutline },
    props: {
        widget: {
            type: Object,
            required: true
        }
    },
    emits: ['widget-selected', 'widget-delete'],
    setup () {
        const { selectedWidgetId, selectWidget, getTypeInfo } = useDesignerState()
        return { selectedWidgetId, selectWidget, getTypeInfo }
    },
    computed: {
        isSelected () {
            return this.selectedWidgetId === this.widget.id
        },
        typeLabel () {
            const info = this.getTypeInfo(this.widget.type)
            return info?.label || this.widget.type
        }
    },
    methods: {
        onSelect () {
            this.selectWidget(this.widget.id, this.widget.type)
            this.$emit('widget-selected', this.widget)
        },
        onDelete () {
            this.$emit('widget-delete', this.widget)
        }
    }
}
</script>

<style scoped>
.designer-widget {
    cursor: pointer;
    transition: outline 0.1s;
}
.designer-widget:hover:not(.designer-widget--selected) {
    outline: 1px dashed rgba(var(--v-theme-primary), 0.3);
    outline-offset: 1px;
    border-radius: 2px;
}
</style>
