import { createContext, useContext, useState, useEffect } from 'react'
import quizService from '../services/quizzes'
import entrancesService from '../services/entrances'
import mediaService from '../services/media'
import analyticsService from '../services/analytics'

/* eslint-disable react-refresh/only-export-components */

const UserContext = createContext()

export const useUser = () => {
    return useContext(UserContext)
}

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedQuizAdmin')
        if (loggedUserJSON) {
            const loggedUser = JSON.parse(loggedUserJSON)
            setTimeout(() => {
                setUser(loggedUser)
            }, 0)
            // Note: services are refactored to use api.js interceptor, 
            // but we keep these temporarily if any old refs exist, 
            // though they should ideally be removed completely if all services use api.js
            if(quizService.setToken) quizService.setToken(loggedUser.token)
            if(entrancesService.setToken) entrancesService.setToken(loggedUser.token)
            if(mediaService.setToken) mediaService.setToken(loggedUser.token)
            if(analyticsService.setToken) analyticsService.setToken(loggedUser.token)
        }
        setTimeout(() => {
            setIsLoading(false)
        }, 0)
    }, [])

    const login = (userData) => {
        window.localStorage.setItem('loggedQuizAdmin', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        window.localStorage.removeItem('loggedQuizAdmin')
        setUser(null)
    }

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}
export default UserProvider
