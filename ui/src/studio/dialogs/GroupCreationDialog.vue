<template>
    <v-dialog :model-value="visible" max-width="480" persistent>
        <v-card class="studio-dialog">
            <v-card-title class="studio-dialog__title">
                Create Group
            </v-card-title>
            <v-card-text class="group-dialog__body">
                <!-- Name -->
                <div class="group-dialog__section">
                    <label class="group-dialog__label">Group Name</label>
                    <v-text-field
                        v-model="form.name"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        placeholder="New Group"
                        autofocus
                        :rules="[v => !!v || 'Name is required']"
                    />
                </div>

                <!-- Width -->
                <div class="group-dialog__section">
                    <label class="group-dialog__label">Width (columns)</label>
                    <div class="group-dialog__width-row">
                        <v-slider
                            v-model="form.width"
                            :min="1"
                            :max="12"
                            :step="1"
                            hide-details
                            thumb-label="always"
                            color="primary"
                            class="group-dialog__slider"
                        />
                        <div class="group-dialog__columns">
                            <div
                                v-for="col in 12"
                                :key="col"
                                class="group-dialog__col"
                                :class="{ 'group-dialog__col--active': col <= form.width }"
                            />
                        </div>
                    </div>
                </div>

                <!-- Show Title -->
                <div class="group-dialog__section group-dialog__toggle-row">
                    <label class="group-dialog__label group-dialog__label--inline">Show Title</label>
                    <v-switch
                        v-model="form.showTitle"
                        density="compact"
                        hide-details
                        color="primary"
                    />
                </div>

                <!-- Group Type -->
                <div class="group-dialog__section">
                    <label class="group-dialog__label">Group Type</label>
                    <v-select
                        v-model="form.groupType"
                        :items="groupTypes"
                        item-title="label"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                    />
                </div>
            </v-card-text>
            <v-card-actions class="studio-dialog__actions">
                <v-spacer />
                <v-btn variant="text" class="studio-dialog__btn" @click="cancel">Cancel</v-btn>
                <v-btn
                    variant="flat"
                    class="studio-dialog__btn-primary"
                    :disabled="!form.name"
                    @click="save"
                >
                    Create
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const GROUP_TYPES = [
    { label: 'Default', value: 'default' },
    { label: 'Dialog', value: 'dialog' }
]

export default {
    name: 'GroupCreationDialog',
    props: {
        visible: { type: Boolean, default: false }
    },
    emits: ['save', 'cancel'],
    data () {
        return {
            form: this.getDefaultForm(),
            groupTypes: GROUP_TYPES
        }
    },
    watch: {
        visible (val) {
            if (val) {
                this.form = this.getDefaultForm()
            }
        }
    },
    methods: {
        getDefaultForm () {
            return {
                name: 'New Group',
                width: 6,
                showTitle: true,
                groupType: 'default'
            }
        },
        cancel () {
            this.$emit('cancel')
        },
        save () {
            if (!this.form.name) return
            this.$emit('save', {
                name: this.form.name,
                width: this.form.width,
                showTitle: this.form.showTitle,
                groupType: this.form.groupType
            })
        }
    }
}
</script>

<style scoped>
.group-dialog__body {
    padding: 8px 20px 16px !important;
}
.group-dialog__section {
    margin-bottom: 16px;
}
.group-dialog__section:last-child {
    margin-bottom: 0;
}
.group-dialog__label {
    display: block;
    font-family: 'Exo 2', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.group-dialog__label--inline {
    display: inline;
    margin-bottom: 0;
}
.group-dialog__width-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.group-dialog__slider {
    flex: 1;
}
.group-dialog__columns {
    display: flex;
    gap: 2px;
    height: 16px;
}
.group-dialog__col {
    flex: 1;
    background-color: #e5e7eb;
    border-radius: 2px;
    transition: background-color 0.15s ease;
}
.group-dialog__col--active {
    background-color: #5a8f00;
}
.group-dialog__toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
