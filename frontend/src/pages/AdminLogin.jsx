const AdminLogin = () => {
  return (
    <section className="admin-login-page">
      <div className="login-card">
        <div className="login-card-header">
          <span className="login-badge">Admin Access</span>
          <h3 className="login-title">Admin Login</h3>
          <p className="login-subtitle">Welcome to QuizSystem Admin Panel</p>
        </div>
        <div className="login-card-body">
          <form method="POST">
            <div className="input-group">
              <label htmlFor="nameInput" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="nameInput"
                name="password"
                placeholder="Please enter the admin password"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Login
            </button>
          </form>
          <p className="login-footnote">Authorized staff only</p>
        </div>
      </div>
    </section>
  )
}

export default AdminLogin
