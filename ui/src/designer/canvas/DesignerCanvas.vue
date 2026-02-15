<template>
    <div class="designer-canvas" @click.self="onCanvasClick">
        <slot />
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

export default {
    name: 'DesignerCanvas',
    setup () {
        const { clearSelection } = useDesignerState()
        return { clearSelection }
    },
    methods: {
        onCanvasClick () {
            this.clearSelection()
        }
    }
}
</script>

<style scoped>
.designer-canvas {
    min-height: 100%;
    position: relative;
}
</style>
