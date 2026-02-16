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
            </template>
            <template v-else-if="target && target.type === 'group'">
                <v-list-item prepend-icon="mdi-card-plus-outline" @click="$emit('add-spacer')">
                    <v-list-item-title>Add Spacer</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </v-menu>
</template>

<script>
export default {
    name: 'ContextMenu',
    props: {
        target: { type: Object, default: null }
    },
    emits: ['duplicate', 'delete', 'move-front', 'move-back', 'add-spacer', 'close'],
    data () {
        return {
            visible: false,
            x: 0,
            y: 0
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
}
</style>
