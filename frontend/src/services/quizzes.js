import api from './api'

const getOne = async (id) => {
    const response = await api.get(`/quizzes/${id}`)
    return response.data
}

const getAll = async () => {
    const response = await api.get('/quizzes')
    return response.data
}

const create = async (newObject) => {
    const response = await api.post('/quizzes', newObject)
    return response.data
}

const update = async (id, newObject) => {
    const response = await api.put(`/quizzes/${id}`, newObject)
    return response.data
}

const remove = async (id) => {
    const response = await api.delete(`/quizzes/${id}`)
    return response.data
}

export default { getOne, getAll, create, update, remove }