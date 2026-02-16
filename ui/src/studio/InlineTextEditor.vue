<template>
    <div class="inline-text-editor" :style="positionStyle">
        <input
            ref="input"
            v-model="localValue"
            class="inline-text-editor__input"
            :style="inputStyle"
            @keydown.enter.prevent="save"
            @keydown.escape.prevent="cancel"
            @blur="save"
        >
    </div>
</template>

<script>
export default {
    name: 'InlineTextEditor',
    props: {
        widgetId: { type: String, required: true },
        initialValue: { type: String, default: '' },
        fieldKey: { type: String, default: 'label' },
        rect: {
            type: Object,
            default: () => ({ top: 0, left: 0, width: 120, height: 32 })
        }
    },
    emits: ['save', 'cancel'],
    data () {
        return {
            localValue: this.initialValue,
            cancelled: false
        }
    },
    computed: {
        positionStyle () {
            return {
                position: 'absolute',
                top: this.rect.top + 'px',
                left: this.rect.left + 'px',
                zIndex: 1000
            }
        },
        inputStyle () {
            return {
                width: Math.max(this.rect.width, 80) + 'px',
                height: this.rect.height + 'px'
            }
        }
    },
    mounted () {
        this.$nextTick(() => {
            const input = this.$refs.input
            if (input) {
                input.focus()
                input.select()
            }
        })
    },
    methods: {
        save () {
            if (this.cancelled) return
            if (this.localValue !== this.initialValue) {
                this.$emit('save', {
                    widgetId: this.widgetId,
                    key: this.fieldKey,
                    value: this.localValue
                })
            } else {
                this.$emit('cancel')
            }
        },
        cancel () {
            this.cancelled = true
            this.$emit('cancel')
        }
    }
}
</script>

<style scoped>
.inline-text-editor {
    pointer-events: auto;
}
.inline-text-editor__input {
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    padding: 2px 6px;
    border: 2px solid rgb(var(--v-theme-primary));
    border-radius: 4px;
    background: #fff;
    outline: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
}
.inline-text-editor__input:focus {
    border-color: rgb(var(--v-theme-primary));
}
</style>
