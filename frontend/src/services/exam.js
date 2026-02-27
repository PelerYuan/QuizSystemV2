import axios from 'axios'

const baseUrl = '/api/exam'

const getEntrance = async (accessCode) => {
    const response = await axios.get(`${baseUrl}/entrance/${accessCode}`)
    return response.data
}

const submitExam = async (payload) => {
    const response = await axios.post(`${baseUrl}/submit`, payload)
    return response.data
}

export default { getEntrance, submitExam }