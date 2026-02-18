/**
 * Dashboard Designer API — Widget Type Discovery
 * Provides GET /dashboard/api/v1/:dashboardId/widget-types
 */
module.exports = function (RED) {
    // Core widget schemas with defaults, categories, and icons
    // These are extracted from the HTML registerType calls — static for reliability
    const CORE_WIDGET_SCHEMAS = {
        'ui-button': {
            category: 'controls',
            icon: 'mdi-gesture-tap-button',
            label: 'Button',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'Button' },
                tooltip: { value: '' },
                color: { value: '' },
                bgcolor: { value: '' },
                className: { value: '' },
                icon: { value: '' },
                iconPosition: { value: 'left' },
                payload: { value: '' },
                payloadType: { value: 'str' },
                topic: { value: 'topic' },
                topicType: { value: 'msg' },
                emulateClick: { value: false }
            }
        },
        'ui-text': {
            category: 'display',
            icon: 'mdi-text',
            label: 'Text',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'text' },
                format: { value: '{{msg.payload}}' },
                layout: { value: 'row-spread' },
                style: { value: false },
                font: { value: '' },
                fontSize: { value: 16 },
                color: { value: '#717171' },
                className: { value: '' }
            }
        },
        'ui-slider': {
            category: 'controls',
            icon: 'mdi-ray-vertex',
            label: 'Slider',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 1 },
                label: { value: 'Slider' },
                tooltip: { value: '' },
                color: { value: '' },
                min: { value: 0 },
                max: { value: 100 },
                step: { value: 1 },
                showTicks: { value: 'never' },
                thumbLabel: { value: 'always' },
                className: { value: '' },
                iconPrepend: { value: '' },
                iconAppend: { value: '' }
            }
        },
        'ui-switch': {
            category: 'controls',
            icon: 'mdi-toggle-switch',
            label: 'Switch',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'Switch' },
                tooltip: { value: '' },
                color: { value: '' },
                oncolor: { value: '' },
                offcolor: { value: '' },
                onvalue: { value: 'true' },
                onvalueType: { value: 'bool' },
                offvalue: { value: 'false' },
                offvalueType: { value: 'bool' },
                className: { value: '' },
                iconOn: { value: '' },
                iconOff: { value: '' },
                layout: { value: 'row-spread' },
                clickableArea: { value: 'switch' }
            }
        },
        'ui-dropdown': {
            category: 'controls',
            icon: 'mdi-form-dropdown',
            label: 'Dropdown',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: '' },
                tooltip: { value: '' },
                multiple: { value: false },
                options: { value: [] },
                className: { value: '' }
            }
        },
        'ui-text-input': {
            category: 'controls',
            icon: 'mdi-form-textbox',
            label: 'Text Input',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'text' },
                tooltip: { value: '' },
                mode: { value: 'text' },
                delay: { value: 300 },
                sendOnBlur: { value: true },
                sendOnEnter: { value: false },
                clearable: { value: false },
                className: { value: '' },
                icon: { value: '' },
                iconPosition: { value: 'left' },
                iconInnerPosition: { value: 'inside' }
            }
        },
        'ui-form': {
            category: 'controls',
            icon: 'mdi-list-box-outline',
            label: 'Form',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 1 },
                label: { value: 'Form' },
                options: { value: [] },
                formValue: { value: {} },
                splitLayout: { value: false },
                resetOnSubmit: { value: true },
                submitOnEnter: { value: false },
                className: { value: '' }
            }
        },
        'ui-template': {
            category: 'advanced',
            icon: 'mdi-code-tags',
            label: 'Template',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 3 },
                format: { value: '' },
                templateScope: { value: 'local' },
                className: { value: '' }
            }
        },
        'ui-chart': {
            category: 'display',
            icon: 'mdi-chart-line',
            label: 'Chart',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 4 },
                label: { value: 'chart' },
                chartType: { value: 'line' },
                xAxisProperty: { value: '' },
                xAxisType: { value: 'time' },
                yAxisProperty: { value: '' },
                removeOlder: { value: 0 },
                removeOlderUnit: { value: '3600' },
                removeOlderPoints: { value: '' },
                showLegend: { value: true },
                className: { value: '' }
            }
        },
        'ui-gauge': {
            category: 'display',
            icon: 'mdi-gauge',
            label: 'Gauge',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 3 },
                gtype: { value: 'gauge-half' },
                gstyle: { value: 'needle' },
                title: { value: 'gauge' },
                units: { value: '' },
                icon: { value: '' },
                prefix: { value: '' },
                suffix: { value: '' },
                min: { value: 0 },
                max: { value: 100 },
                segments: { value: [] },
                className: { value: '' }
            }
        },
        'ui-notification': {
            category: 'display',
            icon: 'mdi-bell',
            label: 'Notification',
            defaults: {
                name: { value: '' },
                ui: { value: '', required: true },
                position: { value: 'top right' },
                colorDefault: { value: '' },
                showCountdown: { value: true },
                displayTime: { value: '3' },
                allowDismiss: { value: true },
                raw: { value: false },
                className: { value: '' }
            }
        },
        'ui-table': {
            category: 'display',
            icon: 'mdi-table',
            label: 'Table',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 4 },
                label: { value: 'table' },
                maxrows: { value: 0 },
                autocols: { value: true },
                columns: { value: [] },
                className: { value: '' }
            }
        },
        'ui-markdown': {
            category: 'display',
            icon: 'mdi-language-markdown-outline',
            label: 'Markdown',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 3 },
                content: { value: '' },
                className: { value: '' }
            }
        },
        'ui-event': {
            category: 'advanced',
            icon: 'mdi-gesture-tap',
            label: 'Event',
            defaults: {
                name: { value: '' },
                ui: { value: '', required: true },
                event: { value: 'page-change' }
            }
        },
        'ui-control': {
            category: 'advanced',
            icon: 'mdi-remote',
            label: 'Control',
            defaults: {
                name: { value: '' },
                ui: { value: '', required: true },
                events: { value: 'all' }
            }
        },
        'ui-radio-group': {
            category: 'controls',
            icon: 'mdi-radiobox-marked',
            label: 'Radio Group',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: '' },
                tooltip: { value: '' },
                options: { value: [] },
                columns: { value: 1 },
                className: { value: '' }
            }
        },
        'ui-button-group': {
            category: 'controls',
            icon: 'mdi-button-cursor',
            label: 'Button Group',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: '' },
                tooltip: { value: '' },
                options: { value: [] },
                rounded: { value: false },
                fullRow: { value: false },
                className: { value: '' }
            }
        },
        'ui-number-input': {
            category: 'controls',
            icon: 'mdi-numeric',
            label: 'Number Input',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'number' },
                tooltip: { value: '' },
                min: { value: 0 },
                max: { value: 100 },
                step: { value: 1 },
                spinner: { value: 'true' },
                wrap: { value: false },
                passthru: { value: true },
                className: { value: '' },
                icon: { value: '' },
                iconPosition: { value: 'left' }
            }
        },
        'ui-date-picker': {
            category: 'controls',
            icon: 'mdi-calendar',
            label: 'Date Picker',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 3 },
                height: { value: 1 },
                label: { value: 'date' },
                className: { value: '' }
            }
        },
        'ui-file-input': {
            category: 'controls',
            icon: 'mdi-file-upload-outline',
            label: 'File Input',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 6 },
                height: { value: 1 },
                label: { value: 'file' },
                tooltip: { value: '' },
                accept: { value: '' },
                multiple: { value: false },
                className: { value: '' },
                icon: { value: '' }
            }
        },
        'ui-spacer': {
            category: 'layout',
            icon: 'mdi-arrow-expand-horizontal',
            label: 'Spacer',
            defaults: {
                name: { value: '' },
                group: { value: '', required: true },
                order: { value: 0 },
                width: { value: 1 },
                height: { value: 1 },
                className: { value: '' }
            }
        },
        'ui-link': {
            category: 'advanced',
            icon: 'mdi-open-in-new',
            label: 'Link',
            defaults: {
                name: { value: '' },
                ui: { value: '', required: true },
                path: { value: '' },
                icon: { value: 'mdi-open-in-new' }
            }
        }
    }

    // Category metadata for display
    const CATEGORIES = [
        { id: 'controls', label: 'Controls', icon: 'mdi-gesture-tap', order: 1 },
        { id: 'display', label: 'Display', icon: 'mdi-monitor', order: 2 },
        { id: 'layout', label: 'Layout', icon: 'mdi-page-layout-body', order: 3 },
        { id: 'advanced', label: 'Advanced', icon: 'mdi-cog', order: 4 },
        { id: 'third-party', label: 'Third Party', icon: 'mdi-puzzle', order: 5 }
    ]

    // Cache for widget types response
    let widgetTypesCache = null
    let widgetTypesCacheTime = 0
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    function buildWidgetTypes () {
        const types = {}

        // Add core widget types
        for (const [type, schema] of Object.entries(CORE_WIDGET_SCHEMAS)) {
            // Only include widgets that have a group property (placeable on canvas)
            if (!schema.defaults.group && !schema.defaults.ui) {
                continue
            }
            types[type] = {
                type,
                label: schema.label,
                icon: schema.icon,
                category: schema.category,
                defaults: schema.defaults,
                isCore: true
            }
        }

        // Discover third-party ui-* widget types from Node-RED registry
        try {
            const nodeList = RED.nodes.getNodeList()
            if (nodeList) {
                for (const nodeInfo of nodeList) {
                    if (!nodeInfo.types) continue
                    for (const typeName of nodeInfo.types) {
                        if (typeName.startsWith('ui-') && !types[typeName]) {
                            types[typeName] = {
                                type: typeName,
                                label: typeName.replace(/^ui-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                                icon: 'mdi-puzzle-outline',
                                category: 'third-party',
                                module: nodeInfo.module,
                                defaults: {
                                    name: { value: '' },
                                    group: { value: '', required: true },
                                    order: { value: 0 },
                                    width: { value: 3 },
                                    height: { value: 1 },
                                    className: { value: '' }
                                },
                                isCore: false
                            }
                        }
                    }
                }
            }
        } catch (err) {
            RED.log.warn('[designer-api] Error discovering third-party widgets: ' + err.message)
        }

        return { types, categories: CATEGORIES }
    }

    // Register the widget-types endpoint
    RED.httpAdmin.get('/dashboard/api/v1/:dashboardId/widget-types', function (req, res) {
        const dashboardId = req.params.dashboardId
        const baseNode = RED.nodes.getNode(dashboardId)
        if (!baseNode) {
            return res.status(404).json({ error: 'Dashboard not found' })
        }

        const now = Date.now()
        if (!widgetTypesCache || (now - widgetTypesCacheTime) > CACHE_TTL) {
            widgetTypesCache = buildWidgetTypes()
            widgetTypesCacheTime = now
        }

        return res.json(widgetTypesCache)
    })

    // Invalidate cache on node install/uninstall
    RED.events.on('runtime-event', function (event) {
        if (event.id === 'node/added' || event.id === 'node/removed') {
            widgetTypesCache = null
            widgetTypesCacheTime = 0
        }
    })

    // Export schemas for use by other modules (e.g., widget validation)
    return {
        CORE_WIDGET_SCHEMAS,
        isKnownWidgetType (type) {
            return !!CORE_WIDGET_SCHEMAS[type] || type.startsWith('ui-')
        }
    }
}
