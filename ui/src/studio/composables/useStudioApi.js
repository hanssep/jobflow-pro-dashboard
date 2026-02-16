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
    createPage ({ dashboard, editorPath }) {
        return axios.request({
            method: 'POST',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages'),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath)
        })
    },
    renamePage ({ dashboard, pageId, name, editorPath }) {
        return axios.request({
            method: 'PATCH',
            url: getDashboardApiUrl(editorPath || '', dashboard, 'studio', 'pages', pageId),
            headers: applyAuth({ 'Content-type': 'application/json' }, editorPath),
            data: { name }
        })
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
    }
}
