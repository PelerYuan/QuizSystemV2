import { useNavigate } from 'react-router-dom'
import EntranceItem from './EntranceItem'

const QuizItem = ({
                      quiz,
                      entrances,
                      isExpanded,
                      onToggleExpand,
                      onDeleteQuiz,
                      onOpenCreateEntrance,
                      entranceActions
                  }) => {
    const navigate = useNavigate()
    const currentQuizId = quiz.id || quiz._id

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Quiz Header */}
            <div
                className="flex flex-col lg:flex-row justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                onClick={() => onToggleExpand(currentQuizId)}
            >
                <div className="flex items-start gap-3 w-full lg:w-auto lg:flex-1 min-w-0">
                    <span className={`mt-1 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-slate-800 truncate">{quiz.name}</h2>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {quiz.description || <span className="italic text-slate-400">No description provided.</span>}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">{entrances.length} exam sessions</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto flex-none" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => onDeleteQuiz(currentQuizId, quiz.name)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded transition-colors whitespace-nowrap"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => navigate(`/admin/editor/${currentQuizId}`)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded transition-colors whitespace-nowrap"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => navigate(`/admin/trial/${currentQuizId}`)}
                        className="flex-1 lg:flex-none px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded transition-colors whitespace-nowrap"
                    >
                        Trial
                    </button>
                </div>
            </div>

            {/* Expanded Entrances Content */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-5 flex flex-col gap-3">
                    {entrances.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No active exam sessions for this quiz.</p>
                    ) : (
                        entrances.map(entrance => (
                            <EntranceItem
                                key={entrance.id || entrance._id}
                                entrance={entrance}
                                {...entranceActions}
                            />
                        ))
                    )}

                    <div className="mt-2 text-right">
                        <button
                            onClick={() => onOpenCreateEntrance(currentQuizId, quiz.name)}
                            className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors px-4 py-2 hover:bg-brand-50 rounded-lg inline-flex items-center gap-1"
                        >
                            <span className="text-lg leading-none">+</span> Generate New Access Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuizItem