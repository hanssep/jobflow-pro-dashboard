/**
 * Dashboard Studio API — Page & Group Management
 * Provides CRUD endpoints for pages and groups in the Studio designer.
 */
const { Agent } = require('https')
const axios = require('axios')

// Property whitelists for security — only these properties can be set via the API
const PAGE_PROPS = new Set([
    'name', 'path', 'icon', 'layout', 'theme',
    'breakpoints', 'className', 'visible', 'disabled'
])
const GROUP_PROPS = new Set([
    'name', 'width', 'height', 'order', 'showTitle',
    'className', 'visible', 'disabled', 'groupType'
])
const VALID_LAYOUTS = new Set(['grid', 'flex', 'tabs', 'notebook'])
const THEME_PROPS = new Set(['colors', 'sizes'])
const VALID_GROUP_TYPES = new Set(['default', 'dialog'])

module.exports = function (RED) {
    /**
     * Build a flows client that can GET and POST flows to the internal Node-RED admin API.
     * Reuses scheme/host/port/https/headers logic so each endpoint stays lean.
     */
    async function getFlowsClient (req) {
        const adminPort = RED.settings.uiPort
        const httpAdminRoot = RED.settings.httpAdminRoot
        const httpsAgent = new Agent({ rejectUnauthorized: false })
        const root = httpAdminRoot.endsWith('/') ? httpAdminRoot : httpAdminRoot + '/'
        const url = `https://localhost:${adminPort}${root}flows`

        const fwd = {}
        if (req.headers.cookie) fwd.cookie = req.headers.cookie
        if (req.headers.authorization) fwd.authorization = req.headers.authorization
        if (req.headers.referer) fwd.referer = req.headers.referer

        async function getFlows () {
            const resp = await axios.request({
                method: 'GET',
                url,
                httpsAgent,
                headers: {
                    'Node-RED-API-Version': 'v2',
                    Accept: 'application/json',
                    ...fwd
                }
            })
            if (resp.status !== 200) {
                const err = new Error(resp?.data?.message || 'Failed to GET flows')
                err.status = resp.status
                throw err
            }
            return { flows: resp.data?.flows || [], rev: resp.data?.rev }
        }

        async function postFlows (flows, rev) {
            const resp = await axios.request({
                method: 'POST',
                url,
                httpsAgent,
                headers: {
                    'Node-RED-Deployment-Type': 'nodes',
                    'Node-RED-API-Version': 'v2',
                    'Content-Type': 'application/json',
                    ...fwd
                },
                data: { flows, rev }
            })
            if (resp.status !== 200) {
                const err = new Error(resp?.data?.message || 'Failed to POST flows')
                err.status = resp.status
                throw err
            }
            return resp.data
        }

        return { getFlows, postFlows }
    }

    /** Validate dashboard exists, return baseNode or send 404 */
    function validateDashboard (dashboardId, res) {
        const baseNode = RED.nodes.getNode(dashboardId)
        if (!baseNode) {
            res.status(404).json({ error: 'Dashboard not found' })
            return null
        }
        return baseNode
    }

    /** Slugify a name into a URL path, handling collisions */
    function slugifyPath (name, existingPaths) {
        const basePath = '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        let candidate = basePath
        let suffix = 2
        while (existingPaths.has(candidate)) {
            candidate = `${basePath}-${suffix}`
            suffix++
        }
        return candidate
    }

    /** Standard error handler for all endpoints */
    function handleError (res, operation, error) {
        console.error(`[studio-api] ${operation} error:`, error.message)
        const status = error.status || error.response?.status || 500
        return res.status(status).json({ error: error.message || 'An error occurred' })
    }

    // ── POST /studio/pages ──────────────────────────────────────────────────
    RED.httpAdmin.post(
        '/dashboard/api/v1/:dashboardId/studio/pages',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const existingPages = flows.filter(n => n.type === 'ui-page' && n.ui === dashboardId)

                // Use provided name or generate smart name
                let pageName = req.body.name
                if (!pageName || typeof pageName !== 'string') {
                    const existingNames = new Set(existingPages.map(p => p.name))
                    pageName = 'Page 1'
                    for (let i = 1; existingNames.has(pageName); i++) {
                        pageName = `Page ${i + 1}`
                    }
                }

                const maxOrder = existingPages.reduce((max, p) => Math.max(max, p.order || 0), 0)
                const themeNode = flows.find(n => n.type === 'ui-theme')
                const existingPaths = new Set(existingPages.map(p => p.path))

                const pageNode = {
                    id: RED.util.generateId(),
                    type: 'ui-page',
                    name: pageName,
                    ui: dashboardId,
                    path: req.body.path || slugifyPath(pageName, existingPaths),
                    icon: req.body.icon || 'home',
                    layout: VALID_LAYOUTS.has(req.body.layout) ? req.body.layout : 'grid',
                    theme: req.body.theme || (themeNode ? themeNode.id : ''),
                    breakpoints: Array.isArray(req.body.breakpoints) ? req.body.breakpoints : [
                        { name: 'Default', px: 0, cols: 3 },
                        { name: 'Tablet', px: 576, cols: 6 },
                        { name: 'Small Desktop', px: 768, cols: 9 },
                        { name: 'Desktop', px: 1024, cols: 12 }
                    ],
                    order: maxOrder + 1,
                    className: req.body.className || '',
                    visible: 'true',
                    disabled: 'false'
                }

                const groupNode = {
                    id: RED.util.generateId(),
                    type: 'ui-group',
                    name: 'Default',
                    page: pageNode.id,
                    width: 6,
                    height: 1,
                    order: 1,
                    showTitle: true,
                    className: '',
                    visible: 'true',
                    disabled: 'false',
                    groupType: 'default'
                }

                flows.push(pageNode)
                flows.push(groupNode)

                await client.postFlows(flows, rev)

                return res.status(201).json({ page: pageNode, group: groupNode })
            } catch (error) {
                return handleError(res, 'POST pages', error)
            }
        }
    )

    // ── PATCH /studio/pages/:pageId ─────────────────────────────────────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const page = flows.find(n => n.id === pageId && n.type === 'ui-page')
                if (!page) {
                    return res.status(404).json({ error: 'Page not found' })
                }
                if (page.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Page does not belong to this dashboard' })
                }

                // Validate specific properties
                if (req.body.layout !== undefined && !VALID_LAYOUTS.has(req.body.layout)) {
                    return res.status(400).json({ error: `Invalid layout: ${req.body.layout}. Must be one of: ${[...VALID_LAYOUTS].join(', ')}` })
                }
                if (req.body.breakpoints !== undefined && !Array.isArray(req.body.breakpoints)) {
                    return res.status(400).json({ error: 'Breakpoints must be an array' })
                }

                // Apply all whitelisted properties from request body
                const nameChanged = req.body.name !== undefined && req.body.name !== page.name
                for (const key of Object.keys(req.body)) {
                    if (PAGE_PROPS.has(key)) {
                        page[key] = req.body[key]
                    }
                }

                // Auto-slugify path if name changed and no explicit path provided
                if (nameChanged && req.body.path === undefined) {
                    const otherPages = flows.filter(n => n.type === 'ui-page' && n.id !== pageId && n.ui === dashboardId)
                    const existingPaths = new Set(otherPages.map(p => p.path))
                    page.path = slugifyPath(page.name, existingPaths)
                }

                // Validate path uniqueness if path was set
                if (req.body.path !== undefined) {
                    const otherPages = flows.filter(n => n.type === 'ui-page' && n.id !== pageId && n.ui === dashboardId)
                    const conflict = otherPages.find(p => p.path === page.path)
                    if (conflict) {
                        return res.status(400).json({ error: `Path "${page.path}" is already used by page "${conflict.name}"` })
                    }
                }

                await client.postFlows(flows, rev)
                return res.json(page)
            } catch (error) {
                return handleError(res, 'PATCH page', error)
            }
        }
    )

    // ── DELETE /studio/pages/:pageId ────────────────────────────────────────
    RED.httpAdmin.delete(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const page = flows.find(n => n.id === pageId && n.type === 'ui-page')
                if (!page) {
                    return res.status(404).json({ error: 'Page not found' })
                }
                if (page.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Page does not belong to this dashboard' })
                }

                const groupIds = new Set()
                const toRemove = new Set([pageId])

                for (const node of flows) {
                    if (node.type === 'ui-group' && node.page === pageId) {
                        groupIds.add(node.id)
                        toRemove.add(node.id)
                    }
                }

                let widgetCount = 0
                for (const node of flows) {
                    if (node.group && groupIds.has(node.group)) {
                        toRemove.add(node.id)
                        widgetCount++
                    }
                }

                const filtered = flows.filter(n => !toRemove.has(n.id))
                await client.postFlows(filtered, rev)

                return res.json({
                    deleted: { page: 1, groups: groupIds.size, widgets: widgetCount }
                })
            } catch (error) {
                return handleError(res, 'DELETE page', error)
            }
        }
    )

    // ── PATCH /studio/pages-order ───────────────────────────────────────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/pages-order',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                if (!validateDashboard(dashboardId, res)) return

                const pageIds = req.body.order
                if (!Array.isArray(pageIds)) {
                    return res.status(400).json({ error: 'order must be an array of page IDs' })
                }

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                for (let i = 0; i < pageIds.length; i++) {
                    const page = flows.find(n => n.id === pageIds[i] && n.type === 'ui-page')
                    if (page) {
                        page.order = i + 1
                    }
                }

                await client.postFlows(flows, rev)
                return res.json({ success: true })
            } catch (error) {
                return handleError(res, 'PATCH pages-order', error)
            }
        }
    )

    // ── POST /studio/pages/:pageId/groups ───────────────────────────────────
    RED.httpAdmin.post(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId/groups',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const page = flows.find(n => n.id === pageId && n.type === 'ui-page')
                if (!page) {
                    return res.status(404).json({ error: 'Page not found' })
                }
                if (page.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Page does not belong to this dashboard' })
                }

                const name = req.body.name
                if (!name || typeof name !== 'string') {
                    return res.status(400).json({ error: 'Name is required' })
                }

                const width = Number(req.body.width) || 6
                if (width < 1 || width > 12) {
                    return res.status(400).json({ error: 'Width must be between 1 and 12' })
                }

                if (req.body.groupType !== undefined && !VALID_GROUP_TYPES.has(req.body.groupType)) {
                    return res.status(400).json({ error: `Invalid group type: ${req.body.groupType}. Must be one of: ${[...VALID_GROUP_TYPES].join(', ')}` })
                }

                const existingGroups = flows.filter(n => n.type === 'ui-group' && n.page === pageId)
                const maxOrder = existingGroups.reduce((max, g) => Math.max(max, g.order || 0), 0)

                const groupNode = {
                    id: RED.util.generateId(),
                    type: 'ui-group',
                    name,
                    page: pageId,
                    width,
                    height: Number(req.body.height) || 1,
                    order: maxOrder + 1,
                    showTitle: req.body.showTitle !== undefined ? !!req.body.showTitle : true,
                    className: req.body.className || '',
                    visible: 'true',
                    disabled: 'false',
                    groupType: req.body.groupType || 'default'
                }

                flows.push(groupNode)
                await client.postFlows(flows, rev)

                return res.status(201).json(groupNode)
            } catch (error) {
                return handleError(res, 'POST group', error)
            }
        }
    )

    // ── PATCH /studio/groups/:gid ───────────────────────────────────────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/groups/:gid',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const gid = req.params.gid
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const group = flows.find(n => n.id === gid && n.type === 'ui-group')
                if (!group) {
                    return res.status(404).json({ error: 'Group not found' })
                }

                // Validate group belongs to this dashboard via its page
                const groupPage = flows.find(n => n.id === group.page && n.type === 'ui-page')
                if (!groupPage || groupPage.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Group does not belong to this dashboard' })
                }

                // Validate specific properties
                if (req.body.width !== undefined) {
                    const w = Number(req.body.width)
                    if (w < 1 || w > 12) {
                        return res.status(400).json({ error: 'Width must be between 1 and 12' })
                    }
                }
                if (req.body.groupType !== undefined && !VALID_GROUP_TYPES.has(req.body.groupType)) {
                    return res.status(400).json({ error: `Invalid group type: ${req.body.groupType}. Must be one of: ${[...VALID_GROUP_TYPES].join(', ')}` })
                }

                // Apply whitelisted properties
                for (const key of Object.keys(req.body)) {
                    if (GROUP_PROPS.has(key)) {
                        group[key] = req.body[key]
                    }
                }

                await client.postFlows(flows, rev)
                return res.json(group)
            } catch (error) {
                return handleError(res, 'PATCH group', error)
            }
        }
    )

    // ── DELETE /studio/pages/:pageId/groups/:gid ────────────────────────────
    RED.httpAdmin.delete(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId/groups/:gid',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                const gid = req.params.gid
                if (!validateDashboard(dashboardId, res)) return

                const mode = req.query.mode || 'cascade'
                if (mode !== 'cascade' && mode !== 'keep') {
                    return res.status(400).json({ error: 'Mode must be "cascade" or "keep"' })
                }

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const page = flows.find(n => n.id === pageId && n.type === 'ui-page')
                if (!page) {
                    return res.status(404).json({ error: 'Page not found' })
                }
                if (page.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Page does not belong to this dashboard' })
                }

                const group = flows.find(n => n.id === gid && n.type === 'ui-group')
                if (!group) {
                    return res.status(404).json({ error: 'Group not found' })
                }
                if (group.page !== pageId) {
                    return res.status(400).json({ error: 'Group does not belong to this page' })
                }

                let widgetCount = 0
                if (mode === 'cascade') {
                    const toRemove = new Set([gid])
                    for (const node of flows) {
                        if (node.group === gid) {
                            toRemove.add(node.id)
                            widgetCount++
                        }
                    }
                    const filtered = flows.filter(n => !toRemove.has(n.id))
                    await client.postFlows(filtered, rev)
                    return res.json({ deleted: { group: 1, widgets: widgetCount } })
                } else {
                    // keep mode: ungroup widgets, delete group only
                    for (const node of flows) {
                        if (node.group === gid) {
                            node.group = ''
                            widgetCount++
                        }
                    }
                    const filtered = flows.filter(n => n.id !== gid)
                    await client.postFlows(filtered, rev)
                    return res.json({ deleted: { group: 1 }, ungrouped: widgetCount })
                }
            } catch (error) {
                return handleError(res, 'DELETE group', error)
            }
        }
    )

    // ── POST /studio/pages/:pageId/groups/:gid/duplicate ────────────────────
    RED.httpAdmin.post(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId/groups/:gid/duplicate',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                const gid = req.params.gid
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const page = flows.find(n => n.id === pageId && n.type === 'ui-page')
                if (!page) {
                    return res.status(404).json({ error: 'Page not found' })
                }
                if (page.ui !== dashboardId) {
                    return res.status(400).json({ error: 'Page does not belong to this dashboard' })
                }

                const group = flows.find(n => n.id === gid && n.type === 'ui-group')
                if (!group) {
                    return res.status(404).json({ error: 'Group not found' })
                }
                if (group.page !== pageId) {
                    return res.status(400).json({ error: 'Group does not belong to this page' })
                }

                // Clone group with new ID
                const newGroupId = RED.util.generateId()
                const existingNames = new Set(flows.filter(n => n.type === 'ui-group').map(g => g.name))
                let newName = req.body?.name || (group.name + ' (Copy)')
                let suffix = 2
                while (existingNames.has(newName)) {
                    newName = group.name + ` (Copy ${suffix})`
                    suffix++
                }

                const newGroup = {
                    ...group,
                    id: newGroupId,
                    name: newName,
                    order: group.order + 1
                }

                // Shift subsequent groups' order
                for (const node of flows) {
                    if (node.type === 'ui-group' && node.page === pageId && node.id !== gid && node.order > group.order) {
                        node.order++
                    }
                }

                // Clone widgets
                const originalWidgets = flows.filter(n => n.group === gid)
                const newWidgets = originalWidgets.map(w => ({
                    ...w,
                    id: RED.util.generateId(),
                    group: newGroupId
                }))

                flows.push(newGroup)
                flows.push(...newWidgets)

                await client.postFlows(flows, rev)

                return res.status(201).json({ group: newGroup, widgets: newWidgets })
            } catch (error) {
                return handleError(res, 'POST duplicate group', error)
            }
        }
    )

    // ── PATCH /studio/themes/:themeId ────────────────────────────────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/themes/:themeId',

        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const themeId = req.params.themeId
                if (!validateDashboard(dashboardId, res)) return

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                const theme = flows.find(n => n.id === themeId && n.type === 'ui-theme')
                if (!theme) {
                    return res.status(404).json({ error: 'Theme not found' })
                }

                // Verify theme belongs to this dashboard (themes are used by pages that belong to the dashboard)
                const dashboardPages = flows.filter(n => n.type === 'ui-page' && n.ui === dashboardId)
                const usedByDashboard = dashboardPages.some(p => p.theme === themeId)
                if (!usedByDashboard) {
                    return res.status(400).json({ error: 'Theme is not used by this dashboard' })
                }

                // Merge whitelisted properties (colors, sizes are sub-objects — merge, not replace)
                for (const key of Object.keys(req.body)) {
                    if (!THEME_PROPS.has(key)) continue
                    if (typeof req.body[key] === 'object' && req.body[key] !== null) {
                        if (!theme[key] || typeof theme[key] !== 'object') {
                            theme[key] = {}
                        }
                        Object.assign(theme[key], req.body[key])
                    } else {
                        theme[key] = req.body[key]
                    }
                }

                await client.postFlows(flows, rev)
                return res.json(theme)
            } catch (error) {
                return handleError(res, 'PATCH theme', error)
            }
        }
    )
}
