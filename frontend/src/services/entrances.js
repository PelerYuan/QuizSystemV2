import api from './api'

const getAll = async () => {
    const response = await api.get('/entrances')
    return response.data
}

const create = async (newObject) => {
    const response = await api.post('/entrances', newObject)
    return response.data
}

const remove = async (id) => {
    const response = await api.delete(`/entrances/${id}`)
    return response.data
}

const update = async (id, newObject) => {
    const response = await api.put(`/entrances/${id}`, newObject)
    return response.data
}

export default { getAll, create, remove, update }