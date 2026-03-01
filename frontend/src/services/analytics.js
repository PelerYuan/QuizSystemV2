import axios from 'axios'

const baseUrl = '/api/analytics'
let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

const getEntranceAnalytics = async (entranceId) => {
    const config = { headers: { Authorization: token } }
    const response = await axios.get(`${baseUrl}/entrance/${entranceId}`, config)
    return response.data
}

const downloadExport = async (entranceId, filename) => {
    const config = {
        headers: { Authorization: token },
        responseType: 'blob'
    }
    const response = await axios.get(`${baseUrl}/export/${entranceId}`, config)

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
}

export default { setToken, getEntranceAnalytics, downloadExport }