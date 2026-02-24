import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pwd })
      });

      const data = await res.json().catch(() => {
        throw new Error("Invalid response from server")
      })  

      if (!res.ok) {
        const message = data.message || "Login failed"
        setError(message)
        return
      }

      navigate("/admin/dashboard")

    }
    catch (error) {
      setError(error.message || "An error occurred during login")
    }
    finally {
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

          {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

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