<template>
    <v-text-field
        ref="input"
        v-model="localName"
        variant="outlined"
        density="compact"
        hide-details
        autofocus
        class="studio-inline-rename"
        @keydown.enter="submit"
        @keydown.esc="cancel"
        @blur="submit"
    />
</template>

<script>
export default {
    name: 'PageCardInlineRename',
    props: {
        currentName: { type: String, default: '' }
    },
    emits: ['rename', 'cancel'],
    data () {
        return {
            localName: this.currentName
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.$refs.input?.focus()
            this.$refs.input?.select?.()
        })
    },
    methods: {
        submit () {
            const name = this.localName.trim()
            if (name && name !== this.currentName) {
                this.$emit('rename', name)
            } else {
                this.$emit('cancel')
            }
        },
        cancel () {
            this.$emit('cancel')
        }
    }
}
</script>

<style scoped>
.studio-inline-rename {
    max-width: 240px;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
}
</style>
