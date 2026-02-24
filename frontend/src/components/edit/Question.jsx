
export default function Question({ onDelete }) {
  return (
    <div className="question-card">
      <div className="question-header">
        <div className="question-title">
          <span className="question-drag">::::</span>
          <strong className="question-name">Question 1</strong>
        </div>
        <button
          type="button"
          className="question-delete"
          aria-label="Delete question"
          onClick={onDelete}
        >
          🗑
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="question-text-1">
          Question Text *
        </label>
        <textarea
          id="question-text-1"
          rows="3"
          placeholder="Enter your question here"
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="question-type-1">
          Question Type *
        </label>
        <select id="question-type-1" className="form-control">
          <option>Multiple Choice (Single Answer)</option>
          <option>Multiple Choice (Multiple Answers)</option>
          <option>Text Input (Not Graded)</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="question-image-1">
          Question Image (Optional)
        </label>
        <label className="image-upload" htmlFor="question-image-1">
          Click to upload image
        </label>
        <input id="question-image-1" type="file" accept="image/*" />
      </div>

      <div className="mb-3">
        <div className="form-label">Answer Options</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="radio" name="answer-1" aria-label="Correct option 1" />
            <input type="text" placeholder="Enter option text" />
            <button type="button" className="btn btn-secondary">
              X
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="radio" name="answer-1" aria-label="Correct option 2" />
            <input type="text" placeholder="Enter option text" />
            <button type="button" className="btn btn-secondary">
              X
            </button>
          </div>
        </div>
        <div className="mt-3">
          <button type="button" className="btn btn-primary">
            + Add Option
          </button>
        </div>
      </div>
    </div>
  );
}
