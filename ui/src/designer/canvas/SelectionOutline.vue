<template>
    <div v-if="isSelected" class="designer-selection-outline" @click.stop>
        <div class="designer-selection-outline__border" />
        <div class="designer-selection-outline__actions">
            <v-btn
                v-tooltip:bottom="'Delete Widget (Del)'"
                icon="mdi-delete-outline"
                size="x-small"
                variant="flat"
                color="error"
                @click.stop="$emit('delete')"
            />
        </div>
        <div class="designer-selection-outline__type-badge">
            {{ typeLabel }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'SelectionOutline',
    props: {
        isSelected: { type: Boolean, default: false },
        typeLabel: { type: String, default: '' }
    },
    emits: ['delete']
}
</script>

<style scoped>
.designer-selection-outline {
    position: absolute;
    inset: -2px;
    pointer-events: none;
    z-index: 50;
}
.designer-selection-outline__border {
    position: absolute;
    inset: 0;
    border: 2px solid rgb(var(--v-theme-primary));
    border-radius: 4px;
    box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.2);
}
.designer-selection-outline__actions {
    position: absolute;
    top: -4px;
    right: -4px;
    display: flex;
    gap: 2px;
    pointer-events: auto;
    transform: translateY(-100%);
}
.designer-selection-outline__type-badge {
    position: absolute;
    bottom: -2px;
    left: 4px;
    transform: translateY(100%);
    font-size: 0.625rem;
    padding: 1px 6px;
    border-radius: 2px;
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    white-space: nowrap;
    pointer-events: none;
}
</style>
