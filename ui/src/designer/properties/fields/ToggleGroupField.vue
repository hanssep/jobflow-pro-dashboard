<template>
    <div class="designer-toggle-group-field">
        <label class="designer-toggle-group-field__label">{{ label }}</label>
        <v-btn-toggle
            :model-value="modelValue"
            density="compact"
            mandatory
            color="primary"
            class="designer-toggle-group-field__toggle"
            @update:model-value="$emit('update:modelValue', $event)"
        >
            <v-btn
                v-for="opt in normalizedOptions"
                :key="opt.value"
                :value="opt.value"
                size="small"
                class="designer-toggle-group-field__btn"
            >
                <v-icon v-if="opt.icon" size="16" :icon="opt.icon" />
                <span v-else>{{ opt.label }}</span>
            </v-btn>
        </v-btn-toggle>
    </div>
</template>

<script>
export default {
    name: 'DesignerToggleGroupField',
    props: {
        modelValue: { type: [String, Number], default: '' },
        label: { type: String, default: '' },
        options: { type: Array, default: () => [] }
    },
    emits: ['update:modelValue'],
    computed: {
        normalizedOptions () {
            return this.options.map(opt => {
                if (typeof opt === 'string') {
                    return { value: opt, label: opt }
                }
                return opt
            })
        }
    }
}
</script>

<style scoped>
.designer-toggle-group-field__label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-bottom: 4px;
}
.designer-toggle-group-field__toggle {
    width: 100%;
}
.designer-toggle-group-field__btn {
    flex: 1;
    font-size: 0.6875rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
}
</style>
