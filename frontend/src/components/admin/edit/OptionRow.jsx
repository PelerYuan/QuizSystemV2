const OptionRow = ({ option, qIndex, optIndex, uiType, actions }) => {
    const { handleOptionTextChange, toggleCorrectAnswer, removeOption } = actions

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input
                type={uiType === 'SINGLE' ? 'radio' : 'checkbox'}
                checked={option.correct}
                onChange={() => toggleCorrectAnswer(qIndex, optIndex)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
            />

            <input
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={option.opt}
                onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                placeholder="Enter option text"
            />

            <button
                onClick={() => removeOption(qIndex, optIndex)}
                style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
                ✖
            </button>
        </div>
    )
}

export default OptionRow