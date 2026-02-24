// components/AdminLogin.jsx
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import loginService from "../services/login";

const AdminLogin = () => {
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null)

        const pwd = password.trim()
        if (!pwd) {
            setError("Password cannot be empty")
            return
        }

        setLoading(true)

        try {
            const user = await loginService.login({password: pwd})
            window.localStorage.setItem('loggedQuizAdmin', JSON.stringify(user))

            // quizService.setToken(user.token)

            navigate("/admin/dashboard")
        } catch (error) {
            const errorMessage = error.response?.data?.error || "An error occurred during login"
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="admin-login-page">
            <div className="login-card">
                <div className="login-card-header">
                    <span className="login-badge">Admin Access</span>
                    <h3 className="login-title">Admin Login</h3>
                    <p className="login-subtitle">Welcome to QuizSystem Admin Panel</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="nameInput" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Please enter the admin password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div style={{color: "crimson", marginTop: 8}}>{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-3"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="login-footnote">Authorized staff only</p>
            </div>
        </section>
    );
}

export default AdminLogin