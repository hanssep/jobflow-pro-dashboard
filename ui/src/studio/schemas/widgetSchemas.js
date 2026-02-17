/**
 * Widget-Specific Studio Schemas
 *
 * Per-widget-type field definitions with proper tab categorization,
 * field types, and ordering. Falls back to auto-generation for unknown types.
 *
 * Each schema defines fields grouped into three tabs: content, style, layout.
 * Field types: 'text', 'textarea', 'number', 'boolean', 'color', 'select',
 *              'toggle-group', 'slider', 'icon', 'size'
 */

export const WIDGET_SCHEMAS = {
    'ui-button': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'icon', type: 'icon', label: 'Icon' },
            { key: 'iconPosition', type: 'select', label: 'Icon Position', options: ['left', 'right'] }
        ],
        style: [
            { key: 'color', type: 'color', label: 'Background Color', themeToken: 'primary' },
            { key: 'textColor', type: 'color', label: 'Text Color', themeToken: 'text' },
            { key: 'iconColor', type: 'color', label: 'Icon Color', themeToken: 'primary' },
            { key: 'variant', type: 'toggle-group', label: 'Variant', options: [
                { value: 'flat', label: 'Flat' },
                { value: 'outlined', label: 'Outlined' },
                { value: 'text', label: 'Text' },
                { value: 'elevated', label: 'Elevated' },
                { value: 'tonal', label: 'Tonal' },
                { value: 'plain', label: 'Plain' }
            ] },
            { key: 'rounded', type: 'boolean', label: 'Rounded' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-text': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'format', type: 'text', label: 'Format' }
        ],
        style: [
            { key: 'layout', type: 'select', label: 'Layout', options: ['row-spread', 'row-left', 'row-center', 'row-right', 'col-center'] },
            { key: 'font', type: 'text', label: 'Font' },
            { key: 'fontSize', type: 'text', label: 'Font Size' },
            { key: 'color', type: 'color', label: 'Color', themeToken: 'text' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-chart': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'chartType', type: 'select', label: 'Chart Type', options: ['line', 'bar', 'scatter', 'pie', 'doughnut', 'radar', 'polarArea'] },
            { key: 'showLegend', type: 'boolean', label: 'Show Legend' },
            { key: 'xAxisLabel', type: 'text', label: 'X Axis Label' },
            { key: 'yAxisLabel', type: 'text', label: 'Y Axis Label' },
            { key: 'xAxisType', type: 'select', label: 'X Axis Type', options: ['linear', 'time', 'category'] },
            { key: 'removeOlder', type: 'number', label: 'Remove Older Than' },
            { key: 'removeOlderUnit', type: 'select', label: 'Remove Older Unit', options: ['1', '60', '3600', '86400'] }
        ],
        style: [
            { key: 'textColor', type: 'color', label: 'Text Color' },
            { key: 'gridColor', type: 'color', label: 'Grid Color' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-gauge': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'gtype', type: 'select', label: 'Gauge Type', options: ['gauge-half', 'gauge-3/4', 'gauge-round'] },
            { key: 'gstyle', type: 'select', label: 'Style', options: ['needle', 'rounded', 'flat'] },
            { key: 'min', type: 'number', label: 'Min' },
            { key: 'max', type: 'number', label: 'Max' },
            { key: 'prefix', type: 'text', label: 'Prefix' },
            { key: 'suffix', type: 'text', label: 'Suffix' }
        ],
        style: [
            { key: 'icon', type: 'icon', label: 'Icon' },
            { key: 'color', type: 'color', label: 'Color', themeToken: 'primary' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-slider': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'min', type: 'number', label: 'Min' },
            { key: 'max', type: 'number', label: 'Max' },
            { key: 'step', type: 'number', label: 'Step' },
            { key: 'showTicks', type: 'select', label: 'Show Ticks', options: ['always', 'never'] },
            { key: 'thumbLabel', type: 'boolean', label: 'Thumb Label' }
        ],
        style: [
            { key: 'color', type: 'color', label: 'Color', themeToken: 'primary' },
            { key: 'iconPrepend', type: 'icon', label: 'Prepend Icon' },
            { key: 'iconAppend', type: 'icon', label: 'Append Icon' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-switch': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'onvalue', type: 'text', label: 'On Value' },
            { key: 'offvalue', type: 'text', label: 'Off Value' },
            { key: 'decouple', type: 'boolean', label: 'Decouple' }
        ],
        style: [
            { key: 'oncolor', type: 'color', label: 'On Color', themeToken: 'primary' },
            { key: 'offcolor', type: 'color', label: 'Off Color', themeToken: 'groupBg' },
            { key: 'onicon', type: 'icon', label: 'On Icon' },
            { key: 'officon', type: 'icon', label: 'Off Icon' },
            { key: 'layout', type: 'select', label: 'Layout', options: ['row-spread', 'row-left', 'row-center', 'row-right', 'col-center'] },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-dropdown': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'multiple', type: 'boolean', label: 'Multiple' },
            { key: 'chips', type: 'boolean', label: 'Chips' }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-text-input': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'mode', type: 'select', label: 'Mode', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'color', 'date', 'time', 'week', 'month'] },
            { key: 'clearable', type: 'boolean', label: 'Clearable' },
            { key: 'sendOnDelay', type: 'boolean', label: 'Send On Delay' },
            { key: 'delay', type: 'number', label: 'Delay (ms)' }
        ],
        style: [
            { key: 'iconPrepend', type: 'icon', label: 'Prepend Icon' },
            { key: 'iconAppend', type: 'icon', label: 'Append Icon' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-markdown': {
        content: [
            { key: 'content', type: 'textarea', label: 'Markdown Content' }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-template': {
        content: [
            { key: 'templateScope', type: 'select', label: 'Scope', options: ['local', 'widget:ui', 'widget:page', 'global:page', 'global:site'] },
            { key: 'format', type: 'textarea', label: 'Template' }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-notification': {
        content: [
            { key: 'position', type: 'select', label: 'Position', options: ['top right', 'top center', 'top left', 'bottom right', 'bottom center', 'bottom left', 'center center'] },
            { key: 'colorDefault', type: 'color', label: 'Default Color' },
            { key: 'timeout', type: 'number', label: 'Timeout (s)' },
            { key: 'allowDismiss', type: 'boolean', label: 'Allow Dismiss' },
            { key: 'showCountdown', type: 'boolean', label: 'Show Countdown' },
            { key: 'raw', type: 'boolean', label: 'Accept Raw HTML' }
        ],
        style: [],
        layout: []
    },

    'ui-form': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'resetOnSubmit', type: 'boolean', label: 'Reset On Submit' },
            { key: 'splitLayout', type: 'boolean', label: 'Two-Column Layout' },
            { key: 'submitText', type: 'text', label: 'Submit Text' },
            { key: 'cancelText', type: 'text', label: 'Cancel Text' }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-radio-group': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'columns', type: 'number', label: 'Columns' }
        ],
        style: [
            { key: 'color', type: 'color', label: 'Color', themeToken: 'primary' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-table': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'maxrows', type: 'number', label: 'Max Rows' },
            { key: 'autocols', type: 'boolean', label: 'Auto Columns' },
            { key: 'showSearch', type: 'boolean', label: 'Show Search' },
            { key: 'selectionType', type: 'select', label: 'Selection Type', options: ['none', 'click', 'checkbox'] }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-number-input': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'tooltip', type: 'text', label: 'Tooltip' },
            { key: 'min', type: 'number', label: 'Min' },
            { key: 'max', type: 'number', label: 'Max' },
            { key: 'step', type: 'number', label: 'Step' },
            { key: 'wrap', type: 'boolean', label: 'Wrap' }
        ],
        style: [
            { key: 'iconPrepend', type: 'icon', label: 'Prepend Icon' },
            { key: 'iconAppend', type: 'icon', label: 'Append Icon' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-date-picker': {
        content: [
            { key: 'label', type: 'text', label: 'Label' },
            { key: 'dateFormat', type: 'text', label: 'Date Format' },
            { key: 'clearable', type: 'boolean', label: 'Clearable' },
            { key: 'multiDate', type: 'boolean', label: 'Multi Date' },
            { key: 'range', type: 'boolean', label: 'Range' }
        ],
        style: [
            { key: 'iconPrepend', type: 'icon', label: 'Prepend Icon' },
            { key: 'iconAppend', type: 'icon', label: 'Append Icon' },
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-webcam': {
        content: [
            { key: 'name', type: 'text', label: 'Name' }
        ],
        style: [
            { key: 'className', type: 'text', label: 'CSS Class' }
        ],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-spacer': {
        content: [],
        style: [],
        layout: [
            { key: 'width', type: 'number', label: 'Width' },
            { key: 'height', type: 'number', label: 'Height' },
            { key: 'order', type: 'number', label: 'Order' }
        ]
    },

    'ui-event': {
        content: [
            { key: 'name', type: 'text', label: 'Name' }
        ],
        style: [],
        layout: []
    },

    'ui-control': {
        content: [
            { key: 'name', type: 'text', label: 'Name' }
        ],
        style: [],
        layout: []
    }
}

/**
 * Get the studio schema for a widget type.
 * Returns null if no schema is registered — caller should fall back to auto-generation.
 * @param {string} widgetType
 * @returns {Object|null} { content: [...], style: [...], layout: [...] }
 */
export function getWidgetSchema (widgetType) {
    return WIDGET_SCHEMAS[widgetType] || null
}

/**
 * Get the style property keys for a widget type.
 * @param {string} widgetType
 * @returns {string[]} Array of style property keys
 */
export function getStyleKeys (widgetType) {
    const schema = WIDGET_SCHEMAS[widgetType]
    if (!schema || !schema.style) return []
    return schema.style.map(f => f.key)
}
