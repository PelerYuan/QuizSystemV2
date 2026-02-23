const AdminDashboard = () => {
  return (
    <main className="admin-page">
      <section className="admin-hero">
        <h1>Quiz Management</h1>
        <p>Manage your quizzes and exams</p>
      </section>

      <section className="admin-content">
        <div className="admin-content-header">
          <h2>Available Quizzes</h2>
          <div className="admin-actions">
            <a className="btn btn-primary" href="/admin/quizzes/new">
              CREATE NEW QUIZ
            </a>
            <label className="btn btn-secondary" htmlFor="importJson">
              IMPORT FROM JSON
            </label>
            <input
              id="importJson"
              type="file"
              accept="application/json"
              className="visually-hidden"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
