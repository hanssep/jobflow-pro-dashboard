/**
 * Group Schema Service — Generates inspector field schemas for group properties
 */

const GROUP_TYPE_OPTIONS = [
    { title: 'Default', value: 'default' },
    { title: 'Dialog', value: 'dialog' }
]

export function getGroupSchema (group = {}) {
    return {
        sections: [
            {
                id: 'general',
                label: 'General',
                collapsed: false,
                fields: [
                    { key: 'name', label: 'Name', type: 'text', value: group.name || '' },
                    { key: 'showTitle', label: 'Show Title', type: 'boolean', value: group.showTitle !== false },
                    { key: 'groupType', label: 'Group Type', type: 'select', value: group.groupType || 'default', options: GROUP_TYPE_OPTIONS }
                ]
            },
            {
                id: 'layout',
                label: 'Layout',
                collapsed: false,
                fields: [
                    { key: 'width', label: 'Width', type: 'number', value: group.width || 6, min: 1, max: 12 },
                    { key: 'height', label: 'Height', type: 'number', value: group.height || 1, min: 0 }
                ]
            },
            {
                id: 'appearance',
                label: 'Appearance',
                collapsed: true,
                fields: [
                    { key: 'className', label: 'CSS Class', type: 'text', value: group.className || '' },
                    { key: 'visible', label: 'Visible', type: 'boolean', value: group.visible !== false && group.visible !== 'false' },
                    { key: 'disabled', label: 'Disabled', type: 'boolean', value: group.disabled === true || group.disabled === 'true' }
                ]
            }
        ]
    }
}

export default { getGroupSchema }
