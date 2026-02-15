/**
 * Widget Schema Service
 * Converts widget type defaults into property field configurations
 * for auto-generating the property editor panel
 */

/**
 * Infer field type from a default value
 * @param {string} key - Property key name
 * @param {*} value - Default value
 * @returns {string} Field type: 'text', 'number', 'boolean', 'color', 'select', 'icon', 'size'
 */
function inferFieldType (key, value) {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') {
        if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'color'
        if (key === 'icon' || key === 'iconPrepend' || key === 'iconAppend' || key === 'iconOn' || key === 'iconOff') return 'icon'
        if (key.toLowerCase().includes('color') || key === 'bgcolor' || key === 'oncolor' || key === 'offcolor') return 'color'
    }
    if (Array.isArray(value)) return 'select' // options arrays
    return 'text'
}

/**
 * Convert a camelCase key into a human-readable label
 * @param {string} key
 * @returns {string}
 */
function keyToLabel (key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .replace(/\bBg\b/g, 'Background')
        .replace(/\bIcon\b/g, 'Icon')
        .trim()
}

/**
 * Determine which section a property belongs to
 * @param {string} key
 * @returns {string} Section id: 'basic', 'content', 'appearance'
 */
function getSection (key) {
    const basicKeys = new Set(['name', 'label', 'group', 'order', 'width', 'height', 'tooltip'])
    const appearanceKeys = new Set([
        'color', 'bgcolor', 'oncolor', 'offcolor', 'className',
        'icon', 'iconPrepend', 'iconAppend', 'iconPosition',
        'iconOn', 'iconOff', 'iconInnerPosition', 'style',
        'font', 'fontSize', 'layout', 'gstyle', 'gtype',
        'rounded', 'fullRow'
    ])

    if (basicKeys.has(key)) return 'basic'
    if (appearanceKeys.has(key)) return 'appearance'
    return 'content'
}

/**
 * Properties to skip in the editor (internal or handled specially)
 */
const SKIP_KEYS = new Set([
    'group', 'ui', '_users', 'enabled', 'visible',
    'wires', 'z', 'd', 'g', 'type', 'id'
])

/**
 * Parse widget defaults into property field configurations
 * @param {Object} defaults - Widget defaults object, e.g. { label: { value: 'Button' }, ... }
 * @param {Object} [currentProps] - Current widget prop values (overrides defaults)
 * @returns {Object} { sections: [ { id, label, collapsed, fields: [...] } ] }
 */
export function parseWidgetSchema (defaults, currentProps = {}) {
    if (!defaults) return { sections: [] }

    const sectionMap = {
        basic: { id: 'basic', label: 'Basic', collapsed: false, fields: [] },
        content: { id: 'content', label: 'Content', collapsed: false, fields: [] },
        appearance: { id: 'appearance', label: 'Appearance', collapsed: true, fields: [] }
    }

    for (const [key, config] of Object.entries(defaults)) {
        if (SKIP_KEYS.has(key)) continue

        const defaultValue = config.value !== undefined ? config.value : config
        const currentValue = currentProps[key] !== undefined ? currentProps[key] : defaultValue
        const fieldType = inferFieldType(key, defaultValue)
        const section = getSection(key)

        const field = {
            key,
            label: keyToLabel(key),
            type: fieldType,
            value: currentValue,
            defaultValue,
            required: !!config.required
        }

        // Add options for select fields
        if (fieldType === 'select' && Array.isArray(defaultValue)) {
            field.options = defaultValue
        }

        if (sectionMap[section]) {
            sectionMap[section].fields.push(field)
        }
    }

    // Only include sections that have fields
    const sections = Object.values(sectionMap).filter(s => s.fields.length > 0)
    return { sections }
}

/**
 * Get editable properties for a widget based on its type
 * @param {Object} store - Vuex store instance
 * @param {string} widgetType - Widget type name
 * @param {Object} currentProps - Current widget properties
 * @returns {Object} { sections: [...] }
 */
export function getEditableProperties (store, widgetType, currentProps = {}) {
    const typeInfo = store.getters['widgetTypes/getType'](widgetType)
    if (!typeInfo) {
        return { sections: [] }
    }
    return parseWidgetSchema(typeInfo.defaults, currentProps)
}

export default {
    parseWidgetSchema,
    getEditableProperties,
    inferFieldType,
    keyToLabel
}
