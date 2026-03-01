import { X } from 'lucide-react'

const OptionRow = ({ option, qIndex, optIndex, uiType, actions }) => {
    const { handleOptionTextChange, toggleCorrectAnswer, removeOption } = actions

    return (
        <div className="flex items-center gap-3 mb-3 group">
            <div className="flex items-center justify-center w-8">
                <input
                    type={uiType === 'SINGLE' ? 'radio' : 'checkbox'}
                    name={uiType === 'SINGLE' ? `question-${qIndex}` : undefined}
                    checked={option.correct || false}
                    onChange={() => toggleCorrectAnswer(qIndex, optIndex)}
                    className="w-5 h-5 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    title="Mark as correct answer"
                />
            </div>

            <input
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-slate-50 hover:bg-white focus:bg-white"
                value={option.opt || ''}
                onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + optIndex)} (e.g. A. Something)`}
            />

            <button
                type="button"
                onClick={() => removeOption(qIndex, optIndex)}
                className="p-3 text-rose-400 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Remove Option"
            >
                <X className="w-5 h-5 flex items-center justify-center m-auto" />
            </button>
        </div>
    )
}

export default OptionRow