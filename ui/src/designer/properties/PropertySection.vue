<template>
    <div class="designer-property-section">
        <div class="designer-property-section__header" @click="isCollapsed = !isCollapsed">
            <v-icon size="16" class="designer-property-section__chevron" :class="{ 'rotated': !isCollapsed }">
                mdi-chevron-right
            </v-icon>
            <span class="designer-property-section__label">{{ section.label }}</span>
        </div>
        <div v-show="!isCollapsed" class="designer-property-section__fields">
            <PropertyField
                v-for="field in section.fields"
                :key="field.key"
                :field="field"
                @change="$emit('field-change', $event)"
            />
        </div>
    </div>
</template>

<script>
import PropertyField from './PropertyField.vue'

export default {
    name: 'PropertySection',
    components: { PropertyField },
    props: {
        section: {
            type: Object,
            required: true
        }
    },
    emits: ['field-change'],
    data () {
        return {
            isCollapsed: this.section.collapsed || false
        }
    }
}
</script>

<style scoped>
.designer-property-section__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(var(--v-theme-on-surface), 0.6);
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.designer-property-section__header:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
}
.designer-property-section__chevron {
    transition: transform 0.2s;
}
.designer-property-section__chevron.rotated {
    transform: rotate(90deg);
}
.designer-property-section__fields {
    padding: 8px 12px;
}
</style>
