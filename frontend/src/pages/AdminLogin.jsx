import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginService from '../services/login'
import quizService from '../services/quizzes'
import entrancesService from "../services/entrances.js";
import mediaService from "../services/media.js";
import analyticService from "../services/analytics.js";
import analytics from "../services/analytics.js";

const AdminLogin = ({ setUser, notify }) => {
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (event) => {
        event.preventDefault()

        if (!password.trim()) {
            notify('Password cannot be empty', 'error')
            return
        }

        setIsLoading(true)

        try {
            const loggedUser = await loginService.login({ password }) // POST /api/auth/login

            window.localStorage.setItem('loggedQuizAdmin', JSON.stringify(loggedUser))
            quizService.setToken(loggedUser.token)
            entrancesService.setToken(loggedUser.token)
            mediaService.setToken(loggedUser.token)
            analyticService.setToken(loggedUser.token)
            setUser(loggedUser)

            notify('Login successful! Welcome back.', 'success')
            navigate('/admin/dashboard')

        } catch (error) {
            const msg = error.response?.data?.error || 'Invalid password or network error'
            notify(msg, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-slate-200 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center text-brand-900 mb-2">Admin Access</h2>
            <p className="text-center text-slate-500 mb-8">Please enter your password to continue</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block mb-2 font-semibold text-slate-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        name="Password"
                        placeholder="Enter admin password"
                        onChange={({ target }) => setPassword(target.value)}
                        className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow box-border"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded font-bold text-white transition-all ${
                        isLoading
                            ? 'bg-brand-300 cursor-not-allowed'
                            : 'bg-brand-500 hover:bg-brand-600 active:scale-95 shadow-md'
                    }`}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}

export default AdminLogin