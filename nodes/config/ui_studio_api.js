/**
 * Dashboard Studio API — Page & Group Management
 * Provides CRUD endpoints for pages and groups in the Studio designer.
 */
const { Agent } = require('https')
const axios = require('axios')

module.exports = function (RED) {
    /**
     * Build a flows client that can GET and POST flows to the internal Node-RED admin API.
     * Reuses scheme/host/port/https/headers logic so each endpoint stays lean.
     */
    async function getFlowsClient (req) {
        // HTTPS-only internal call to Node-RED admin API (JobFlow Pro)
        const adminPort = RED.settings.uiPort
        const httpAdminRoot = RED.settings.httpAdminRoot
        const httpsAgent = new Agent({ rejectUnauthorized: false })
        const root = httpAdminRoot.endsWith('/') ? httpAdminRoot : httpAdminRoot + '/'
        const url = `https://localhost:${adminPort}${root}flows`

        // Forward auth-related headers from the incoming request
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

    // ── POST /dashboard/api/v1/:dashboardId/studio/pages ──────────────────
    RED.httpAdmin.post(
        '/dashboard/api/v1/:dashboardId/studio/pages',
        RED.auth.needsPermission('flows.write'),
        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const baseNode = RED.nodes.getNode(dashboardId)
                if (!baseNode) {
                    return res.status(404).json({ error: 'Dashboard not found' })
                }

                const client = await getFlowsClient(req)
                const { flows, rev } = await client.getFlows()

                // Determine smart name
                const existingPages = flows.filter(n => n.type === 'ui-page' && n.ui === dashboardId)
                const existingNames = new Set(existingPages.map(p => p.name))
                let smartName = 'Page 1'
                for (let i = 1; existingNames.has(smartName); i++) {
                    smartName = `Page ${i + 1}`
                }

                // Determine next order
                const maxOrder = existingPages.reduce((max, p) => Math.max(max, p.order || 0), 0)

                // Find first theme
                const themeNode = flows.find(n => n.type === 'ui-theme')
                const themeId = themeNode ? themeNode.id : ''

                const pageNode = {
                    id: RED.util.generateId(),
                    type: 'ui-page',
                    name: smartName,
                    ui: dashboardId,
                    path: '/' + smartName.toLowerCase().replace(/\s+/g, '-'),
                    icon: 'home',
                    layout: 'grid',
                    theme: themeId,
                    breakpoints: [
                        { name: 'Default', px: 0, cols: 3 },
                        { name: 'Tablet', px: 576, cols: 6 },
                        { name: 'Small Desktop', px: 768, cols: 9 },
                        { name: 'Desktop', px: 1024, cols: 12 }
                    ],
                    order: maxOrder + 1,
                    className: '',
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
                    disabled: 'false'
                }

                flows.push(pageNode)
                flows.push(groupNode)

                await client.postFlows(flows, rev)

                return res.status(201).json({ page: pageNode, group: groupNode })
            } catch (error) {
                console.error('[studio-api] POST pages error:', error.message)
                const status = error.status || error.response?.status || 500
                return res.status(status).json({ error: error.message || 'An error occurred' })
            }
        }
    )

    // ── PATCH /dashboard/api/v1/:dashboardId/studio/pages/:pageId ─────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId',
        RED.auth.needsPermission('flows.write'),
        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                const baseNode = RED.nodes.getNode(dashboardId)
                if (!baseNode) {
                    return res.status(404).json({ error: 'Dashboard not found' })
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

                const newName = req.body.name
                if (!newName || typeof newName !== 'string') {
                    return res.status(400).json({ error: 'Name is required' })
                }

                page.name = newName

                // Slugify path
                let basePath = '/' + newName.toLowerCase().replace(/\s+/g, '-')
                const otherPages = flows.filter(n => n.type === 'ui-page' && n.id !== pageId && n.ui === dashboardId)
                const existingPaths = new Set(otherPages.map(p => p.path))

                let candidatePath = basePath
                let suffix = 2
                while (existingPaths.has(candidatePath)) {
                    candidatePath = `${basePath}-${suffix}`
                    suffix++
                }
                page.path = candidatePath

                await client.postFlows(flows, rev)

                return res.json(page)
            } catch (error) {
                console.error('[studio-api] PATCH page error:', error.message)
                const status = error.status || error.response?.status || 500
                return res.status(status).json({ error: error.message || 'An error occurred' })
            }
        }
    )

    // ── DELETE /dashboard/api/v1/:dashboardId/studio/pages/:pageId ────────
    RED.httpAdmin.delete(
        '/dashboard/api/v1/:dashboardId/studio/pages/:pageId',
        RED.auth.needsPermission('flows.write'),
        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const pageId = req.params.pageId
                const baseNode = RED.nodes.getNode(dashboardId)
                if (!baseNode) {
                    return res.status(404).json({ error: 'Dashboard not found' })
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

                // Collect groups belonging to this page
                const groupIds = new Set()
                const toRemove = new Set([pageId])

                for (const node of flows) {
                    if (node.type === 'ui-group' && node.page === pageId) {
                        groupIds.add(node.id)
                        toRemove.add(node.id)
                    }
                }

                // Collect widgets belonging to those groups
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
                    deleted: {
                        page: 1,
                        groups: groupIds.size,
                        widgets: widgetCount
                    }
                })
            } catch (error) {
                console.error('[studio-api] DELETE page error:', error.message)
                const status = error.status || error.response?.status || 500
                return res.status(status).json({ error: error.message || 'An error occurred' })
            }
        }
    )

    // ── PATCH /dashboard/api/v1/:dashboardId/studio/pages-order ───────────
    RED.httpAdmin.patch(
        '/dashboard/api/v1/:dashboardId/studio/pages-order',
        RED.auth.needsPermission('flows.write'),
        async function (req, res) {
            try {
                const dashboardId = req.params.dashboardId
                const baseNode = RED.nodes.getNode(dashboardId)
                if (!baseNode) {
                    return res.status(404).json({ error: 'Dashboard not found' })
                }

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
                console.error('[studio-api] PATCH pages-order error:', error.message)
                const status = error.status || error.response?.status || 500
                return res.status(status).json({ error: error.message || 'An error occurred' })
            }
        }
    )
}
