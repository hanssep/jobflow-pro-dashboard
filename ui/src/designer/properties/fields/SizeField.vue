<template>
    <div class="designer-size-field">
        <span class="designer-size-field__label">{{ label }}</span>
        <div class="designer-size-field__inputs">
            <v-text-field
                :model-value="width"
                label="W"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                min="1"
                style="max-width: 80px;"
                @update:model-value="$emit('update:width', parseInt($event) || 1)"
            />
            <span class="designer-size-field__x">&times;</span>
            <v-text-field
                :model-value="height"
                label="H"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                min="1"
                style="max-width: 80px;"
                @update:model-value="$emit('update:height', parseInt($event) || 1)"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'DesignerSizeField',
    props: {
        width: { type: Number, default: 1 },
        height: { type: Number, default: 1 },
        label: { type: String, default: 'Size' }
    },
    emits: ['update:width', 'update:height']
}
</script>

<style scoped>
.designer-size-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.designer-size-field__label {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-weight: 500;
}
.designer-size-field__inputs {
    display: flex;
    align-items: center;
    gap: 8px;
}
.designer-size-field__x {
    color: rgba(var(--v-theme-on-surface), 0.4);
    font-size: 0.875rem;
}
</style>
