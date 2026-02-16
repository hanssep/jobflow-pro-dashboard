<template>
    <v-app-bar flat density="compact" color="surface" class="studio-toolbar" :elevation="0">
        <!-- Pages mode: back + title + add page -->
        <template v-if="mode === 'pages'">
            <v-btn icon variant="text" title="Back to Dashboard" @click="$emit('go-back')">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="studio-toolbar__title">
                Dashboard Studio
            </v-toolbar-title>
            <v-spacer />
            <v-btn
                color="primary"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                :loading="creating"
                rounded="sm"
                @click="$emit('create-page')"
            >
                Add Page
            </v-btn>
        </template>

        <!-- Editing mode: breadcrumb + actions -->
        <template v-else>
            <v-btn icon variant="text" title="Back to Pages (Esc)" @click="$emit('back-to-pages')">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="studio-toolbar__title studio-toolbar__breadcrumb">
                <span class="studio-toolbar__breadcrumb-studio" @click="$emit('back-to-pages')">Studio</span>
                <v-icon size="16" class="mx-1">mdi-chevron-right</v-icon>
                <span class="studio-toolbar__breadcrumb-page">{{ pageName }}</span>
            </v-toolbar-title>
            <v-spacer />

            <!-- Toggle property panel -->
            <v-btn
                v-tooltip="'Toggle Properties Panel'"
                :variant="propertiesVisible ? 'flat' : 'outlined'"
                icon="mdi-tune"
                size="small"
                :color="propertiesVisible ? 'primary' : undefined"
                class="studio-toolbar__btn"
                @click="$emit('toggle-properties')"
            />

            <v-divider vertical class="mx-1" />

            <!-- Undo -->
            <v-btn
                v-tooltip="'Undo (Ctrl+Z)'"
                :disabled="!canUndo || saving"
                variant="outlined"
                icon="mdi-undo"
                size="small"
                color="orange"
                class="studio-toolbar__btn"
                @click="$emit('undo')"
            />
            <!-- Redo -->
            <v-btn
                v-tooltip="'Redo (Ctrl+Shift+Z)'"
                :disabled="!canRedo || saving"
                variant="outlined"
                icon="mdi-redo"
                size="small"
                color="orange"
                class="studio-toolbar__btn"
                @click="$emit('redo')"
            />
            <!-- Discard -->
            <v-btn
                v-tooltip="'Discard All Changes'"
                :disabled="!dirty || saving"
                variant="outlined"
                icon="mdi-arrow-u-left-top"
                size="small"
                color="blue"
                class="studio-toolbar__btn"
                @click="$emit('discard')"
            />
            <!-- Save -->
            <v-btn
                v-tooltip="'Save Changes (Ctrl+S)'"
                :disabled="!dirty || saving"
                variant="outlined"
                icon="mdi-content-save-outline"
                size="small"
                color="green"
                :loading="saving"
                class="studio-toolbar__btn"
                @click="$emit('save')"
            />
        </template>
    </v-app-bar>
</template>

<script>
import { useDesignerState } from '../designer/composables/useDesignerState.js'

export default {
    name: 'StudioToolbar',
    props: {
        mode: { type: String, default: 'pages' },
        creating: { type: Boolean, default: false },
        pageName: { type: String, default: '' },
        dirty: { type: Boolean, default: false },
        saving: { type: Boolean, default: false },
        canUndo: { type: Boolean, default: false },
        canRedo: { type: Boolean, default: false }
    },
    emits: [
        'create-page', 'go-back', 'back-to-pages',
        'save', 'discard', 'undo', 'redo', 'toggle-properties'
    ],
    setup () {
        const { isPropertiesVisible } = useDesignerState()
        return { propertiesVisible: isPropertiesVisible }
    }
}
</script>

<style scoped>
.studio-toolbar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.studio-toolbar__title {
    font-size: 16px;
    font-weight: 600;
}
.studio-toolbar__breadcrumb {
    display: flex;
    align-items: center;
    gap: 0;
}
.studio-toolbar__breadcrumb-studio {
    cursor: pointer;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-weight: 500;
    font-size: 14px;
}
.studio-toolbar__breadcrumb-studio:hover {
    color: rgb(var(--v-theme-primary));
    text-decoration: underline;
}
.studio-toolbar__breadcrumb-page {
    font-weight: 600;
    font-size: 14px;
}
.studio-toolbar__btn {
    border-radius: 2rem;
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    min-height: 2rem;
    margin: 0 2px;
}
.studio-toolbar__btn:disabled {
    filter: grayscale(1);
}
</style>
