<template>
    <v-dialog :model-value="visible" max-width="480" @update:model-value="$emit('update:visible', $event)">
        <v-card class="studio-dialog">
            <v-card-title class="studio-dialog__title">
                Choose Icon
            </v-card-title>
            <v-card-text class="icon-picker__body">
                <v-text-field
                    v-model="search"
                    density="compact"
                    variant="outlined"
                    placeholder="Search icons..."
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                    clearable
                    autofocus
                    class="icon-picker__search"
                />
                <div v-if="currentIcon" class="icon-picker__current">
                    <span class="icon-picker__current-label">Current:</span>
                    <v-icon size="20">mdi-{{ currentIcon }}</v-icon>
                    <span class="icon-picker__current-name">{{ currentIcon }}</span>
                </div>
                <div class="icon-picker__grid">
                    <div
                        v-for="icon in filteredIcons"
                        :key="icon"
                        class="icon-picker__item"
                        :class="{ 'icon-picker__item--active': icon === selectedIcon }"
                        :title="icon"
                        @click="selectedIcon = icon"
                    >
                        <v-icon size="22">mdi-{{ icon }}</v-icon>
                    </div>
                    <div v-if="!filteredIcons.length" class="icon-picker__empty">
                        No icons match "{{ search }}"
                    </div>
                </div>
            </v-card-text>
            <v-card-actions class="studio-dialog__actions">
                <v-spacer />
                <v-btn variant="text" class="studio-dialog__btn" @click="$emit('update:visible', false)">Cancel</v-btn>
                <v-btn
                    variant="flat"
                    class="studio-dialog__btn-primary"
                    :disabled="!selectedIcon"
                    @click="confirm"
                >
                    Select
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
// Common dashboard-relevant MDI icons (curated subset)
const COMMON_ICONS = [
    'home', 'view-dashboard', 'chart-line', 'chart-bar', 'chart-areaspline', 'gauge',
    'thermometer', 'water-percent', 'weather-sunny', 'weather-partly-cloudy',
    'lightbulb', 'lightbulb-outline', 'led-on', 'flash', 'battery', 'solar-power',
    'cog', 'wrench', 'tools', 'tune', 'settings-helper',
    'bell', 'bell-outline', 'alert', 'alert-circle', 'information', 'help-circle',
    'check-circle', 'close-circle', 'minus-circle', 'plus-circle',
    'play', 'pause', 'stop', 'skip-next', 'skip-previous', 'refresh',
    'power', 'power-plug', 'power-socket', 'electric-switch',
    'eye', 'eye-off', 'lock', 'lock-open', 'shield', 'shield-check',
    'account', 'account-group', 'account-circle', 'login', 'logout',
    'file', 'folder', 'file-document', 'clipboard-text', 'database',
    'wifi', 'bluetooth', 'access-point', 'router-wireless', 'lan',
    'map-marker', 'map', 'earth', 'navigation', 'compass',
    'camera', 'image', 'video', 'monitor', 'television', 'printer',
    'clock', 'timer', 'calendar', 'alarm', 'history',
    'email', 'phone', 'message', 'chat', 'forum', 'send',
    'star', 'heart', 'thumb-up', 'bookmark', 'flag',
    'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
    'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
    'menu', 'dots-vertical', 'dots-horizontal', 'apps', 'grid',
    'magnify', 'filter', 'sort', 'swap-vertical',
    'download', 'upload', 'cloud', 'cloud-upload', 'cloud-download',
    'link', 'open-in-new', 'share', 'export', 'import',
    'delete', 'pencil', 'content-copy', 'content-paste', 'content-cut',
    'plus', 'minus', 'close', 'check', 'undo', 'redo',
    'table', 'format-list-bulleted', 'view-list', 'view-grid', 'view-module',
    'robot', 'robot-industrial', 'factory', 'warehouse', 'truck',
    'water', 'fire', 'fan', 'air-conditioner', 'radiator',
    'numeric-1-box', 'numeric-2-box', 'numeric-3-box', 'alpha-a-box', 'alpha-b-box'
]

export default {
    name: 'IconPickerDialog',
    props: {
        visible: { type: Boolean, default: false },
        currentIcon: { type: String, default: '' }
    },
    emits: ['update:visible', 'select'],
    data () {
        return {
            search: '',
            selectedIcon: this.currentIcon || ''
        }
    },
    computed: {
        filteredIcons () {
            if (!this.search) return COMMON_ICONS
            const q = this.search.toLowerCase()
            return COMMON_ICONS.filter(icon => icon.includes(q))
        }
    },
    watch: {
        visible (val) {
            if (val) {
                this.selectedIcon = this.currentIcon || ''
                this.search = ''
            }
        }
    },
    methods: {
        confirm () {
            this.$emit('select', this.selectedIcon)
            this.$emit('update:visible', false)
        }
    }
}
</script>

<style scoped>
.icon-picker__body {
    padding: 12px 20px !important;
}
.icon-picker__search {
    margin-bottom: 12px;
}
.icon-picker__current {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(90, 143, 0, 0.06);
    border-radius: 6px;
    margin-bottom: 12px;
}
.icon-picker__current-label {
    font-family: 'Exo 2', sans-serif;
    font-size: 12px;
    color: #666;
}
.icon-picker__current-name {
    font-family: 'Exo 2', sans-serif;
    font-size: 12px;
    color: #333;
    font-weight: 500;
}
.icon-picker__grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    max-height: 280px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 4px;
}
.icon-picker__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.1s;
}
.icon-picker__item:hover {
    background: #f0f0f0;
}
.icon-picker__item--active {
    background: rgba(90, 143, 0, 0.12);
    outline: 2px solid #5a8f00;
}
.icon-picker__empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 24px;
    font-family: 'Exo 2', sans-serif;
    font-size: 13px;
    color: #999;
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
</style>
