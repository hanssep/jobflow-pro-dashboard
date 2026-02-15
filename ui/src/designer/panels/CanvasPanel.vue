<template>
    <div class="designer-canvas-panel" @click.self="onCanvasClick">
        <slot />
    </div>
</template>

<script>
import { useDesignerState } from '../composables/useDesignerState.js'

export default {
    name: 'CanvasPanel',
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
.designer-canvas-panel {
    flex: 1;
    overflow: auto;
    position: relative;
    min-width: 0;
}
</style>
