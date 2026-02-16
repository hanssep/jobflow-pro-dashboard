/**
 * Page Schema Service — Generates inspector field schemas for page properties
 */

const LAYOUT_OPTIONS = [
    { title: 'Grid', value: 'grid' },
    { title: 'Fixed', value: 'flex' },
    { title: 'Tabs', value: 'tabs' },
    { title: 'Notebook', value: 'notebook' }
]

export function getPageSchema (page = {}) {
    return {
        sections: [
            {
                id: 'general',
                label: 'General',
                collapsed: false,
                fields: [
                    { key: 'name', label: 'Name', type: 'text', value: page.name || '' },
                    { key: 'path', label: 'URL Path', type: 'text', value: page.path || '' },
                    { key: 'icon', label: 'Icon', type: 'icon', value: page.icon || 'home' },
                    { key: 'layout', label: 'Layout', type: 'select', value: page.layout || 'grid', options: LAYOUT_OPTIONS }
                ]
            },
            {
                id: 'appearance',
                label: 'Appearance',
                collapsed: false,
                fields: [
                    { key: 'className', label: 'CSS Class', type: 'text', value: page.className || '' },
                    { key: 'visible', label: 'Visible', type: 'boolean', value: page.visible !== 'false' },
                    { key: 'disabled', label: 'Disabled', type: 'boolean', value: page.disabled === 'true' }
                ]
            }
        ]
    }
}

export default { getPageSchema }
