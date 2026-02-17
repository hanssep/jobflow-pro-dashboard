<template>
    <v-menu
        v-model="visible"
        :style="menuStyle"
        location="top start"
        origin="top start"
        :close-on-content-click="true"
    >
        <template #activator="{ props: menuProps }">
            <div
                ref="anchor"
                v-bind="menuProps"
                :style="anchorStyle"
                class="studio-context-anchor"
            />
        </template>
        <v-list density="compact" class="studio-context-menu">
            <!-- Widget context menu -->
            <template v-if="target && target.type === 'widget'">
                <v-list-item prepend-icon="mdi-content-copy" @click="$emit('duplicate')">
                    <v-list-item-title>Duplicate</v-list-item-title>
                    <template #append><span class="text-caption text-medium-emphasis">Ctrl+D</span></template>
                </v-list-item>
                <v-list-item prepend-icon="mdi-delete-outline" @click="$emit('delete')">
                    <v-list-item-title>Delete</v-list-item-title>
                    <template #append><span class="text-caption text-medium-emphasis">Del</span></template>
                </v-list-item>
                <v-divider />
                <v-list-item prepend-icon="mdi-arrange-bring-to-front" @click="$emit('move-front')">
                    <v-list-item-title>Move to Front</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-arrange-send-to-back" @click="$emit('move-back')">
                    <v-list-item-title>Move to Back</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item prepend-icon="mdi-palette-swatch-outline" @click="$emit('copy-style')">
                    <v-list-item-title>Copy Style</v-list-item-title>
                    <template #append><span class="text-caption text-medium-emphasis">Ctrl+Shift+C</span></template>
                </v-list-item>
                <v-list-item prepend-icon="mdi-palette-swatch" :disabled="!hasStyleClipboard" @click="$emit('paste-style')">
                    <v-list-item-title>Paste Style</v-list-item-title>
                    <template #append><span class="text-caption text-medium-emphasis">Ctrl+Shift+V</span></template>
                </v-list-item>
                <v-divider />
                <!-- Move to Group submenu -->
                <v-menu location="end" open-on-hover :close-on-content-click="true">
                    <template #activator="{ props: subProps }">
                        <v-list-item v-bind="subProps" prepend-icon="mdi-folder-move-outline">
                            <v-list-item-title>Move to Group</v-list-item-title>
                            <template #append><v-icon size="small">mdi-chevron-right</v-icon></template>
                        </v-list-item>
                    </template>
                    <v-list density="compact" class="studio-context-menu">
                        <v-list-item
                            v-for="g in availableGroups"
                            :key="g.id"
                            @click="$emit('move-to-group', g.id)"
                        >
                            <v-list-item-title>{{ g.name }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="!availableGroups.length" disabled>
                            <v-list-item-title class="text-medium-emphasis">No other groups</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <!-- Group context menu -->
            <template v-else-if="target && target.type === 'group'">
                <v-list-item prepend-icon="mdi-pencil-outline" @click="$emit('rename-group')">
                    <v-list-item-title>Rename Group</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-content-copy" @click="$emit('duplicate-group')">
                    <v-list-item-title>Duplicate Group</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-card-plus-outline" @click="$emit('add-spacer')">
                    <v-list-item-title>Add Spacer</v-list-item-title>
                </v-list-item>
                <!-- Change Width submenu -->
                <v-menu location="end" open-on-hover :close-on-content-click="true">
                    <template #activator="{ props: subProps }">
                        <v-list-item v-bind="subProps" prepend-icon="mdi-arrow-expand-horizontal">
                            <v-list-item-title>Change Width</v-list-item-title>
                            <template #append><v-icon size="small">mdi-chevron-right</v-icon></template>
                        </v-list-item>
                    </template>
                    <v-list density="compact" class="studio-context-menu">
                        <v-list-item
                            v-for="w in widthOptions"
                            :key="w"
                            @click="$emit('change-group-width', { width: w })"
                        >
                            <v-list-item-title>{{ w }} columns</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-divider />
                <v-list-item prepend-icon="mdi-delete-outline" class="text-error" @click="$emit('delete-group')">
                    <v-list-item-title>Delete Group</v-list-item-title>
                </v-list-item>
            </template>

            <!-- Canvas (empty area) context menu -->
            <template v-else-if="!target">
                <v-list-item prepend-icon="mdi-plus-box-outline" @click="$emit('add-group')">
                    <v-list-item-title>Add Group</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-grid" @click="$emit('toggle-grid')">
                    <v-list-item-title>Toggle Grid Overlay</v-list-item-title>
                    <template v-if="gridOverlay" #append><v-icon size="small" color="success">mdi-check</v-icon></template>
                </v-list-item>
            </template>
        </v-list>
    </v-menu>
</template>

<script>
export default {
    name: 'ContextMenu',
    props: {
        target: { type: Object, default: null },
        groups: { type: Array, default: () => [] },
        currentGroupId: { type: String, default: '' },
        hasStyleClipboard: { type: Boolean, default: false },
        gridOverlay: { type: Boolean, default: false }
    },
    emits: [
        'duplicate', 'delete', 'move-front', 'move-back',
        'copy-style', 'paste-style', 'move-to-group',
        'add-spacer', 'rename-group', 'duplicate-group', 'delete-group',
        'change-group-width',
        'add-group', 'toggle-grid',
        'close'
    ],
    data () {
        return {
            visible: false,
            x: 0,
            y: 0,
            widthOptions: [3, 4, 6, 9, 12]
        }
    },
    computed: {
        anchorStyle () {
            return {
                position: 'fixed',
                left: `${this.x}px`,
                top: `${this.y}px`,
                width: '1px',
                height: '1px',
                pointerEvents: 'none'
            }
        },
        menuStyle () {
            return {}
        },
        availableGroups () {
            return this.groups.filter(g => g.id !== this.currentGroupId)
        }
    },
    watch: {
        visible (val) {
            if (!val) this.$emit('close')
        }
    },
    methods: {
        open (x, y) {
            this.x = x
            this.y = y
            this.$nextTick(() => {
                this.visible = true
            })
        },
        close () {
            this.visible = false
        }
    }
}
</script>

<style scoped>
.studio-context-anchor {
    position: fixed;
    pointer-events: none;
    z-index: -1;
}
.studio-context-menu {
    min-width: 180px;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
