<template>
    <div class="designer-property-field">
        <component
            :is="fieldComponent"
            v-bind="fieldProps"
            @update:model-value="onUpdate"
            @update:width="onUpdateWidth"
            @update:height="onUpdateHeight"
        />
    </div>
</template>

<script>
import BooleanField from './fields/BooleanField.vue'
import ColorField from './fields/ColorField.vue'
import IconField from './fields/IconField.vue'
import NumberField from './fields/NumberField.vue'
import SelectField from './fields/SelectField.vue'
import SizeField from './fields/SizeField.vue'
import SliderField from './fields/SliderField.vue'
import TextField from './fields/TextField.vue'
import TextareaField from './fields/TextareaField.vue'
import ToggleGroupField from './fields/ToggleGroupField.vue'

const FIELD_COMPONENTS = {
    text: TextField,
    textarea: TextareaField,
    number: NumberField,
    boolean: BooleanField,
    color: ColorField,
    select: SelectField,
    icon: IconField,
    size: SizeField,
    slider: SliderField,
    'toggle-group': ToggleGroupField
}

export default {
    name: 'PropertyField',
    props: {
        field: {
            type: Object,
            required: true
        }
    },
    emits: ['change'],
    computed: {
        fieldComponent () {
            const comp = FIELD_COMPONENTS[this.field.type]
            if (!comp) {
                console.warn('[PropertyField] Unknown type:', this.field.type, 'for key:', this.field.key, '→ fallback to TextField')
            }
            return comp || TextField
        },
        fieldProps () {
            const props = {
                label: this.field.label
            }

            if (this.field.type === 'size') {
                props.width = this.field.value?.width || 1
                props.height = this.field.value?.height || 1
            } else if (this.field.type === 'select') {
                props.modelValue = this.field.value
                props.items = this.field.options || []
            } else if (this.field.type === 'toggle-group') {
                props.modelValue = this.field.value
                props.options = this.field.options || []
            } else if (this.field.type === 'slider') {
                props.modelValue = this.field.value
                if (this.field.min !== undefined) props.min = this.field.min
                if (this.field.max !== undefined) props.max = this.field.max
                if (this.field.step !== undefined) props.step = this.field.step
            } else {
                props.modelValue = this.field.value
            }
            // Pass theme token info for color fields
            if (this.field.type === 'color' && this.field.themeToken) {
                props.themeToken = this.field.themeToken
                props.themeValue = this.field.themeValue || null
            }
            return props
        }
    },
    methods: {
        onUpdate (value) {
            this.$emit('change', { key: this.field.key, value })
        },
        onUpdateWidth (value) {
            this.$emit('change', { key: 'width', value })
        },
        onUpdateHeight (value) {
            this.$emit('change', { key: 'height', value })
        }
    }
}
</script>

<style scoped>
.designer-property-field {
    padding: 4px 0;
}
</style>
