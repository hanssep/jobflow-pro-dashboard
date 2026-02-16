<template>
    <div class="breakpoints-editor">
        <div class="breakpoints-editor__presets">
            <v-chip
                v-for="preset in presets"
                :key="preset.label"
                size="small"
                variant="outlined"
                :color="isPresetActive(preset) ? '#5a8f00' : undefined"
                @click="applyPreset(preset)"
            >
                {{ preset.label }}
            </v-chip>
        </div>
        <div class="breakpoints-editor__list">
            <div
                v-for="(bp, idx) in localBreakpoints"
                :key="idx"
                class="breakpoints-editor__item"
            >
                <v-text-field
                    v-model="bp.name"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="breakpoints-editor__name"
                    @update:model-value="emitUpdate"
                />
                <v-text-field
                    v-model.number="bp.px"
                    density="compact"
                    variant="outlined"
                    hide-details
                    type="number"
                    min="0"
                    suffix="px"
                    class="breakpoints-editor__px"
                    @update:model-value="emitUpdate"
                />
                <v-text-field
                    v-model.number="bp.cols"
                    density="compact"
                    variant="outlined"
                    hide-details
                    type="number"
                    min="1"
                    max="12"
                    suffix="col"
                    class="breakpoints-editor__cols"
                    @update:model-value="emitUpdate"
                />
                <v-btn
                    v-if="localBreakpoints.length > 1"
                    icon
                    size="x-small"
                    variant="text"
                    @click="removeBreakpoint(idx)"
                >
                    <v-icon size="16">mdi-close</v-icon>
                </v-btn>
            </div>
        </div>
        <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-plus"
            class="breakpoints-editor__add"
            @click="addBreakpoint"
        >
            Add Breakpoint
        </v-btn>
        <div class="breakpoints-editor__preview">
            <div
                v-for="bp in sortedBreakpoints"
                :key="bp.name"
                class="breakpoints-editor__preview-item"
            >
                <span class="breakpoints-editor__preview-label">{{ bp.name }}</span>
                <div class="breakpoints-editor__preview-grid" :style="{ '--cols': bp.cols }">
                    <div v-for="n in bp.cols" :key="n" class="breakpoints-editor__preview-col" />
                </div>
                <span class="breakpoints-editor__preview-info">{{ bp.px }}px+ &middot; {{ bp.cols }} col</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BreakpointsEditor',
    props: {
        modelValue: {
            type: Array,
            default: () => [
                { name: 'Default', px: 0, cols: 3 },
                { name: 'Tablet', px: 576, cols: 6 },
                { name: 'Small Desktop', px: 768, cols: 9 },
                { name: 'Desktop', px: 1024, cols: 12 }
            ]
        }
    },
    emits: ['update:modelValue'],
    data () {
        return {
            localBreakpoints: [],
            presets: [
                {
                    label: 'Standard (4)',
                    breakpoints: [
                        { name: 'Default', px: 0, cols: 3 },
                        { name: 'Tablet', px: 576, cols: 6 },
                        { name: 'Small Desktop', px: 768, cols: 9 },
                        { name: 'Desktop', px: 1024, cols: 12 }
                    ]
                },
                {
                    label: 'Simple (2)',
                    breakpoints: [
                        { name: 'Mobile', px: 0, cols: 3 },
                        { name: 'Desktop', px: 768, cols: 12 }
                    ]
                },
                {
                    label: 'Full Width',
                    breakpoints: [
                        { name: 'Default', px: 0, cols: 12 }
                    ]
                }
            ]
        }
    },
    computed: {
        sortedBreakpoints () {
            return [...this.localBreakpoints].sort((a, b) => a.px - b.px)
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler (val) {
                this.localBreakpoints = (val || []).map(bp => ({ ...bp }))
            }
        }
    },
    methods: {
        emitUpdate () {
            this.$emit('update:modelValue', this.localBreakpoints.map(bp => ({
                name: bp.name,
                px: Number(bp.px) || 0,
                cols: Math.max(1, Math.min(12, Number(bp.cols) || 3))
            })))
        },
        applyPreset (preset) {
            this.localBreakpoints = preset.breakpoints.map(bp => ({ ...bp }))
            this.emitUpdate()
        },
        isPresetActive (preset) {
            if (this.localBreakpoints.length !== preset.breakpoints.length) return false
            return preset.breakpoints.every((bp, i) => {
                const local = this.localBreakpoints[i]
                return local && local.px === bp.px && local.cols === bp.cols
            })
        },
        addBreakpoint () {
            const maxPx = this.localBreakpoints.reduce((max, bp) => Math.max(max, bp.px || 0), 0)
            this.localBreakpoints.push({
                name: 'Custom',
                px: maxPx + 200,
                cols: 6
            })
            this.emitUpdate()
        },
        removeBreakpoint (idx) {
            this.localBreakpoints.splice(idx, 1)
            this.emitUpdate()
        }
    }
}
</script>

<style scoped>
.breakpoints-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.breakpoints-editor__presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}
.breakpoints-editor__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.breakpoints-editor__item {
    display: flex;
    align-items: center;
    gap: 6px;
}
.breakpoints-editor__name {
    flex: 2;
}
.breakpoints-editor__px {
    flex: 1;
    max-width: 90px;
}
.breakpoints-editor__cols {
    flex: 1;
    max-width: 75px;
}
.breakpoints-editor__add {
    align-self: flex-start;
    font-family: 'Exo 2', sans-serif;
    text-transform: none;
    font-size: 12px;
}
.breakpoints-editor__preview {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}
.breakpoints-editor__preview-item {
    display: flex;
    align-items: center;
    gap: 8px;
}
.breakpoints-editor__preview-label {
    font-family: 'Exo 2', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #555;
    min-width: 65px;
}
.breakpoints-editor__preview-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: 2px;
    flex: 1;
    height: 12px;
}
.breakpoints-editor__preview-col {
    background: rgba(90, 143, 0, 0.2);
    border-radius: 1px;
    border: 1px solid rgba(90, 143, 0, 0.3);
}
.breakpoints-editor__preview-info {
    font-family: 'Exo 2', sans-serif;
    font-size: 10px;
    color: #999;
    min-width: 70px;
    text-align: right;
}
</style>
