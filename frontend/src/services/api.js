import axios from 'axios'

const api = axios.create({
    baseURL: '/api'
})

// Request interceptor to attach the auth token to every request
api.interceptors.request.use(
    (config) => {
        const loggedUserJSON = window.localStorage.getItem('loggedQuizAdmin')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api
