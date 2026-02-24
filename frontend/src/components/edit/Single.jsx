import { useState } from 'react'




export default function Single() {

  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ])

  const [selectedId, setSelectedId] = useState(null)

  const selectOption = (optionId) => {
    setSelectedId(optionId)
  }

  const updateOptionText = (optionId, newText) => {
    setOptions(prevOptions =>
      prevOptions.map(option =>
        option.id === optionId ? { ...option, text: newText } : option
      )
    )
  }

  const deleteOption = (deleteId) => {
    setOptions(prevOptions => prevOptions.filter(option => option.id !== deleteId))
    if (deleteId === selectedId) {
      setSelectedId(null)
    }
  }


  return (
    <div className="single-option">
      {options.map((option) => {
        const active = option.id === selectedId;
        return (
          <div
            key={option.id}
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <input
              type="radio"
              name="answer-1"
              aria-label={`Correct option ${option.id}`}
              checked={active}
              onChange={() => selectOption(option.id)}
            />
            <input
              type="text"
              placeholder="Enter option text"
              value={option.text}
              onChange={(e) => updateOptionText(option.id, e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => deleteOption(option.id)}
            >
              X
            </button>
          </div>
        );
      })}
    </div>
  );

  
  
  
}
