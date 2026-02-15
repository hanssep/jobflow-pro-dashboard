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
import TextField from './fields/TextField.vue'

const FIELD_COMPONENTS = {
    text: TextField,
    number: NumberField,
    boolean: BooleanField,
    color: ColorField,
    select: SelectField,
    icon: IconField,
    size: SizeField
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
            return FIELD_COMPONENTS[this.field.type] || TextField
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
            } else {
                props.modelValue = this.field.value
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
