import api from './api'

const getEntrance = async (accessCode) => {
    const response = await api.get(`/exam/entrance/${accessCode}`)
    return response.data
}

const submitExam = async (payload) => {
    const response = await api.post(`/exam/submit`, payload)
    return response.data
}

const getResult = async (submissionId) => {
    const response = await api.get(`/exam/result/${submissionId}`)
    return response.data
}

export default {
    getEntrance,
    submitExam,
    getResult
}