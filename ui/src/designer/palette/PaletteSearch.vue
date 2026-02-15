<template>
    <div class="designer-palette-search">
        <v-text-field
            v-model="searchText"
            density="compact"
            variant="outlined"
            placeholder="Search widgets..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            single-line
            @update:model-value="$emit('update:modelValue', $event || '')"
        />
    </div>
</template>

<script>
export default {
    name: 'PaletteSearch',
    props: {
        modelValue: {
            type: String,
            default: ''
        }
    },
    emits: ['update:modelValue'],
    data () {
        return {
            searchText: this.modelValue
        }
    },
    watch: {
        modelValue (val) {
            this.searchText = val
        }
    }
}
</script>

<style scoped>
.designer-palette-search {
    padding: 8px 12px;
}
</style>
