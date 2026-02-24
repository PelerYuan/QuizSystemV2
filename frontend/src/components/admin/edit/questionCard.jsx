import OptionRow from './OptionRow'

const QuestionCard = ({ question, qIndex, actions }) => {
    const { removeQuestion, handleQuestionChange, addOption } = actions

    return (
        <div style={{ border: '1px solid #007bff', padding: '20px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#fff' }}>

            {/* Header & Delete Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#007bff', margin: 0 }}>⋮⋮ Question {qIndex + 1}</h3>
                <button
                    onClick={() => removeQuestion(qIndex)}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    🗑 Delete
                </button>
            </div>

            {/* Question Text */}
            <div style={{ marginBottom: '15px' }}>
                <label><b>Question Text *</b></label>
                <textarea
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={question.Q}
                    onChange={(e) => handleQuestionChange(qIndex, 'Q', e.target.value)}
                    placeholder="Enter your question here"
                />
            </div>

            {/* Question Type Selector */}
            <div style={{ marginBottom: '15px' }}>
                <label><b>Question Type *</b></label>
                <select
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={question.uiType}
                    onChange={(e) => handleQuestionChange(qIndex, 'uiType', e.target.value)}
                >
                    <option value="SINGLE">Multiple Choice (Single Answer)</option>
                    <option value="MULTIPLE">Multiple Choice (Multiple Answers)</option>
                    <option value="TEXT">Text Input (Not Graded)</option>
                </select>
            </div>

            {/* Media Upload Placeholder (To be connected with /api/media) */}
            <div style={{ border: '2px dashed #007bff', padding: '30px', textAlign: 'center', marginBottom: '15px', borderRadius: '4px', color: '#555', cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                ☁️ Click to upload image
            </div>

            {/* Dynamic Render based on Question Type */}
            <div>
                <label><b>{question.uiType === 'TEXT' ? 'Text Input Field' : 'Answer Options'}</b></label>

                {question.uiType === 'TEXT' ? (
                    <div style={{ backgroundColor: '#e9ecef', padding: '15px', marginTop: '5px', borderRadius: '4px', color: '#6c757d' }}>
                        Students will type their answer here<br/>
                        <small>This question will not be automatically graded.</small>
                    </div>
                ) : (
                    <div style={{ marginTop: '10px' }}>
                        {question.options.map((opt, optIndex) => (
                            <OptionRow
                                key={optIndex}
                                option={opt}
                                qIndex={qIndex}
                                optIndex={optIndex}
                                uiType={question.uiType}
                                actions={actions} // Pass the bundled actions down to OptionRow
                            />
                        ))}
                        <button
                            onClick={() => addOption(qIndex)}
                            style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', marginTop: '5px', cursor: 'pointer' }}
                        >
                            + Add Option
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionCard