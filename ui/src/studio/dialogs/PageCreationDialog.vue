<template>
    <v-dialog :model-value="visible" max-width="560" persistent>
        <v-card class="studio-dialog">
            <v-card-title class="studio-dialog__title">
                {{ isEdit ? 'Page Settings' : 'Create Page' }}
            </v-card-title>
            <v-card-text class="page-dialog__body">
                <!-- Name & Path -->
                <div class="page-dialog__section">
                    <label class="page-dialog__label">Page Name</label>
                    <v-text-field
                        v-model="form.name"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        placeholder="My Page"
                        autofocus
                        :rules="[v => !!v || 'Name is required']"
                    />
                </div>
                <div class="page-dialog__section">
                    <label class="page-dialog__label">URL Path</label>
                    <v-text-field
                        v-model="form.path"
                        density="compact"
                        variant="outlined"
                        hide-details
                        placeholder="/my-page"
                        :prefix="pathPrefix"
                    />
                    <span class="page-dialog__hint">Auto-generated from name if left empty</span>
                </div>

                <!-- Icon -->
                <div class="page-dialog__section">
                    <label class="page-dialog__label">Icon</label>
                    <div class="page-dialog__icon-row">
                        <v-btn
                            variant="outlined"
                            size="small"
                            class="page-dialog__icon-btn"
                            @click="iconPickerVisible = true"
                        >
                            <v-icon class="mr-2">mdi-{{ form.icon || 'home' }}</v-icon>
                            {{ form.icon || 'home' }}
                        </v-btn>
                    </div>
                </div>

                <!-- Layout Type -->
                <div class="page-dialog__section">
                    <label class="page-dialog__label">Layout</label>
                    <LayoutTypeSelector v-model="form.layout" />
                </div>

                <!-- Theme -->
                <div class="page-dialog__section">
                    <label class="page-dialog__label">Theme</label>
                    <ThemeSelector v-model="form.theme" />
                </div>

                <!-- Breakpoints (only for grid layout) -->
                <div v-if="form.layout === 'grid'" class="page-dialog__section">
                    <label class="page-dialog__label">Responsive Breakpoints</label>
                    <BreakpointsEditor v-model="form.breakpoints" />
                </div>
            </v-card-text>
            <v-card-actions class="studio-dialog__actions">
                <v-spacer />
                <v-btn variant="text" class="studio-dialog__btn" @click="cancel">Cancel</v-btn>
                <v-btn
                    variant="flat"
                    class="studio-dialog__btn-primary"
                    :loading="saving"
                    :disabled="!form.name"
                    @click="save"
                >
                    {{ isEdit ? 'Save' : 'Create' }}
                </v-btn>
            </v-card-actions>
        </v-card>

        <IconPickerDialog
            v-model:visible="iconPickerVisible"
            :current-icon="form.icon"
            @select="form.icon = $event"
        />
    </v-dialog>
</template>

<script>
import BreakpointsEditor from '../editors/BreakpointsEditor.vue'
import LayoutTypeSelector from '../editors/LayoutTypeSelector.vue'
import ThemeSelector from '../editors/ThemeSelector.vue'
import IconPickerDialog from './IconPickerDialog.vue'

const DEFAULT_BREAKPOINTS = [
    { name: 'Default', px: 0, cols: 3 },
    { name: 'Tablet', px: 576, cols: 6 },
    { name: 'Small Desktop', px: 768, cols: 9 },
    { name: 'Desktop', px: 1024, cols: 12 }
]

export default {
    name: 'PageCreationDialog',
    components: { LayoutTypeSelector, BreakpointsEditor, ThemeSelector, IconPickerDialog },
    props: {
        visible: { type: Boolean, default: false },
        mode: { type: String, default: 'create' },
        page: { type: Object, default: null }
    },
    emits: ['save', 'cancel'],
    data () {
        return {
            saving: false,
            iconPickerVisible: false,
            form: this.getDefaultForm()
        }
    },
    computed: {
        isEdit () {
            return this.mode === 'edit'
        },
        pathPrefix () {
            return ''
        }
    },
    watch: {
        visible (val) {
            if (val) {
                this.form = this.isEdit && this.page
                    ? this.getFormFromPage(this.page)
                    : this.getDefaultForm()
                this.saving = false
            }
        },
        'form.name' (val) {
            // Auto-generate path from name (only in create mode or if path is empty)
            if (!this.isEdit && val && !this.form.pathManuallyEdited) {
                this.form.path = '/' + val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            }
        }
    },
    methods: {
        getDefaultForm () {
            return {
                name: '',
                path: '',
                icon: 'home',
                layout: 'grid',
                theme: '',
                breakpoints: DEFAULT_BREAKPOINTS.map(b => ({ ...b })),
                pathManuallyEdited: false
            }
        },
        getFormFromPage (page) {
            return {
                name: page.name || '',
                path: page.path || '',
                icon: page.icon || 'home',
                layout: page.layout || 'grid',
                theme: page.theme || '',
                breakpoints: Array.isArray(page.breakpoints)
                    ? page.breakpoints.map(b => ({ ...b }))
                    : DEFAULT_BREAKPOINTS.map(b => ({ ...b })),
                pathManuallyEdited: true
            }
        },
        cancel () {
            this.$emit('cancel')
        },
        save () {
            if (!this.form.name) return
            this.saving = true
            this.$emit('save', {
                name: this.form.name,
                path: this.form.path || undefined,
                icon: this.form.icon,
                layout: this.form.layout,
                theme: this.form.theme || undefined,
                breakpoints: this.form.layout === 'grid' ? this.form.breakpoints : undefined
            })
        }
    }
}
</script>

<style scoped>
.page-dialog__body {
    padding: 8px 20px 16px !important;
    max-height: 70vh;
    overflow-y: auto;
}
.page-dialog__section {
    margin-bottom: 16px;
}
.page-dialog__section:last-child {
    margin-bottom: 0;
}
.page-dialog__label {
    display: block;
    font-family: 'Exo 2', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.page-dialog__hint {
    font-family: 'Exo 2', sans-serif;
    font-size: 11px;
    color: #999;
    margin-top: 2px;
}
.page-dialog__icon-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
.page-dialog__icon-btn {
    font-family: 'Exo 2', sans-serif;
    text-transform: none;
    font-size: 13px;
}

/* Reuse studio-dialog styles */
.studio-dialog {
    border-radius: 8px !important;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #ccc !important;
}
.studio-dialog__title {
    font-family: 'Exo 2', sans-serif;
    font-size: 16px !important;
    font-weight: 600;
    color: #333;
    padding: 20px 20px 8px !important;
}
.studio-dialog__actions {
    padding: 8px 16px 16px !important;
}
.studio-dialog__btn {
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-transform: none;
}
.studio-dialog__btn-primary {
    background-color: #5a8f00 !important;
    color: white !important;
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
}
.studio-dialog__btn-primary:hover {
    background-color: #4a7a00 !important;
}
</style>
