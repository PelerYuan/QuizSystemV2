import { useState } from "react";



export const Multiple = () => {
  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);

  const [selectedIds, setSelectedIds] = useState([]);

  const selectOption = (optionId) => {
    setSelectedIds((prevIds) =>
      prevIds.includes(optionId)
        ? prevIds.filter((id) => id !== optionId)
        : [...prevIds, optionId]
    );
  };

  const updateOptionText = (optionId, newText) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === optionId ? { ...option, text: newText } : option
      )
    );
  };

  const deleteOption = (deleteId) => {
    setOptions((prevOptions) =>
      prevOptions.filter((option) => option.id !== deleteId)
    );
    if (selectedIds.includes(deleteId)) {
      setSelectedIds((prevOptions) => prevOptions.filter((id) => id !== deleteId));
    }
  };


  return (
    <div className="multiple-option">
      {options.map((option) => {
        const active = selectedIds.includes(option.id);

        return (
          <div
            key={option.id}
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <button
              type="button"
              onClick={() => selectOption(option.id)}
              aria-pressed={active}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: "1px solid #999",
                display: "grid",
                placeItems: "center",
                background: active ? "black" : "transparent",
                color: active ? "white" : "black",
                cursor: "pointer",
              }}
              title="Toggle"
            >
              {active ? "✓" : ""}
            </button>

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
