import { Multiple } from "../components/edit/Multiple.jsx";
import Question from "../components/edit/Question.jsx";
import Single from "../components/edit/Single.jsx";
import TextMark from "../components/edit/TextMark.jsx";

const AdminEdit = () => {
  return (
    <div className="admin-page">
      <header className="admin-hero">
        <h1>Create New Quiz</h1>
        <p>Visual Quiz Editor</p>
      </header>

      <section className="app-content">
        <div className="mb-3">
          <a href="/admin/dashboard">&lt;- Back to Admin</a>
        </div>

        <div className="quiz-information">
          <div className="card-header">Quiz Information</div>
          <div className="card-body">
            <div className="input-entrance">
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label className="form-label" htmlFor="quiz-title">Title *</label>
                <input id="quiz-title" type="text" placeholder="Enter quiz title" />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <label className="form-label" htmlFor="quiz-subtitle">Subtitle *</label>
                <input id="quiz-subtitle" type="text" placeholder="Enter quiz subtitle" />
              </div>
            </div>

            <div className="input-entrance">
              <div style={{ flex: 2, minWidth: '280px' }}>
                <label className="form-label" htmlFor="quiz-description">Description *</label>
                <textarea
                  id="quiz-description"
                  rows="4"
                  placeholder="Enter quiz description"
                />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="form-label" htmlFor="quiz-points">Points per Question *</label>
                <input id="quiz-points" type="number" min="1" placeholder="1" />
              </div>
            </div>
          </div>
        </div>

        <Multiple />


        <TextMark />


        <div className="card">
          <div className="card-header">Questions</div>
          <div className="card-body">
            <button type="button" className="btn btn-secondary w-100">+ Add Question</button>
          </div>
        </div>

        <div className="text-center">
          <button type="button" className="btn btn-primary">Save Quiz</button>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: '12px' }}>Cancel</button>
        </div>
      </section>
    </div>
  )
}

export default AdminEdit
