import api from './api'
const getEntranceAnalytics = async (entranceId) => {
    const response = await api.get(`/analytics/entrance/${entranceId}`)
    return response.data
}

const downloadExport = async (entranceId, filename) => {
    const config = {
        responseType: 'blob'
    }
    const response = await api.get(`/analytics/export/${entranceId}`, config)

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export default { getEntranceAnalytics, downloadExport }