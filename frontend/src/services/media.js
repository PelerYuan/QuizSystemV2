import axios from 'axios'

const baseUrl = '/api/media'
let token = null

const setToken = newToken => {
    token = `Bearer ${newToken}`
}

const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const config = {
        headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data'
        }
    }
    const response = await axios.post(`${baseUrl}/upload`, formData, config)
    return response.data
}

export default { setToken, uploadImage }