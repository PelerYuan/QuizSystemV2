import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginService from '../services/login'
import quizService from '../services/quizzes'

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
        <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Admin Access</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Please enter your password to continue</p>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        name="Password"
                        placeholder="Enter admin password"
                        onChange={({ target }) => setPassword(target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{ width: '100%', padding: '12px', backgroundColor: isLoading ? '#9bc2e6' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}

export default AdminLogin