import axios from 'axios'

function applyAuth (headers, editorPath) {
    let itemName = 'auth-tokens'
    if (editorPath) {
        itemName += `-${editorPath.replace(/\//g, '-')}`
    }
    let authTokens = localStorage.getItem(itemName)
    if (!authTokens) {
        authTokens = localStorage.getItem('auth-tokens')
    }
    if (authTokens) {
        authTokens = JSON.parse(authTokens)
        const token = authTokens.access_token
        const tokenType = authTokens.token_type ? authTokens.token_type : 'Bearer'
        headers.Authorization = `${tokenType} ${token}`
    }
    return headers
}

function getDashboardApiUrl (editorPath, dashboardId, ...path) {
    const url = new URL(window.location.href)
    const pathParts = ['dashboard', 'api', 'v1', dashboardId, ...(path || [])]
        .map(p => p.replace(/^\/|\/$/g, ''))
    if (editorPath) {
        pathParts.unshift(editorPath.replace(/\/$/, '').replace(/^\/+/, ''))
    }
    const result = new URL(url)
    result.search = ''
    result.pathname = '/' + pathParts.filter(Boolean).join('/')
    return result
}

export default {
    // ── Page endpoints ──────────────────────────────────────────────────────
    createPage ({ dashboard, editorPath, name, path, icon, layout, theme, breakpoints, className }) {
        const data = {}
        if (name) data.name = name
        if (path) data.path = path
        if (icon) data.icon = icon
        if (layout) data.layout = layout
        if (theme) data.theme = theme
        if (breakpoints) data.breakpoints = breakpoints
        if (className) data.className = className
        return axios.request({
            method: 'POST',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data
        })
    },
    updatePage ({ dashboard, pageId, editorPath, updates }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: updates
        })
    },
    renamePage ({ dashboard, pageId, name, editorPath }) {
        return this.updatePage({ dashboard, pageId, editorPath, updates: { name } })
    },
    deletePage ({ dashboard, pageId, editorPath }) {
        return axios.request({
            method: 'DELETE',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath)
        })
    },
    reorderPages ({ dashboard, order, editorPath }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages-order'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: { order }
        })
    },
    startEditPage ({ dashboard, pageId, editorPath }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'edit', pageId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: { mode: 'edit', dashboard, page: pageId }
        })
    },

    // ── Group endpoints ─────────────────────────────────────────────────────
    createGroup ({ dashboard, pageId, editorPath, name, width, height, showTitle, groupType, className }) {
        const data = { name }
        if (width !== undefined) data.width = width
        if (height !== undefined) data.height = height
        if (showTitle !== undefined) data.showTitle = showTitle
        if (groupType) data.groupType = groupType
        if (className) data.className = className
        return axios.request({
            method: 'POST',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId, 'groups'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data
        })
    },
    updateGroup ({ dashboard, groupId, editorPath, updates }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'groups', groupId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: updates
        })
    },
    deleteGroup ({ dashboard, pageId, groupId, editorPath, mode }) {
        let url = getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId, 'groups', groupId)
        if (mode) {
            url = new URL(url)
            url.searchParams.set('mode', mode)
        }
        return axios.request({
            method: 'DELETE',
            url: url.toString(),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath)
        })
    },
    duplicateGroup ({ dashboard, pageId, groupId, editorPath, name }) {
        return axios.request({
            method: 'POST',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId, 'groups', groupId, 'duplicate'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: name ? { name } : {}
        })
    },

    // ── Theme endpoints ──────────────────────────────────────────────────
    updateTheme ({ dashboard, themeId, editorPath, updates }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'themes', themeId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: updates
        })
    }
}
