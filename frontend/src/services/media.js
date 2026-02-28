import api from './api'
const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    const response = await api.post('/media/upload', formData, config)
    return response.data
}

export default { uploadImage }