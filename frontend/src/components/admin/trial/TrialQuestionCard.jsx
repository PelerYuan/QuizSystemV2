const TrialQuestionCard = ({ q, index, pointsPerQuestion }) => {
    const isText = q.itext !== undefined
    const correctCount = q.options?.filter(opt => opt.correct === true || opt.correct === 'true').length || 0
    const isMultiChoice = correctCount > 1

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex flex-col">
                <div className="flex gap-4">
                    <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit">
                        Q {index + 1}
                    </span>
                    <div className="w-full">
                        <h3 className="text-lg font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {q.Q}
                        </h3>
                        <div className="mt-2 pr-4 border-t border-slate-200 pt-2">
                            <p className="text-xs text-brand-500 font-bold uppercase tracking-wide">
                                {isText ? 'Subjective Question - Ungraded' : `Max ${pointsPerQuestion} Points`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {isText ? (
                    <div className="w-full p-4 min-h-[8rem] rounded border bg-slate-50 text-slate-400 italic border-slate-200 flex items-center justify-center">
                        [ Text Input Area For Students ]
                    </div>
                ) : (
                    <div className="space-y-3">
                        {q.options.map((optItem, optIdx) => {
                            const isCorrect = optItem.correct === true || optItem.correct === 'true'

                            const style = isCorrect
                                ? "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500"
                                : "border-slate-200 bg-white opacity-60 text-slate-500"

                            return (
                                <div key={optIdx} className={`flex items-center p-4 rounded-lg border transition-all ${style}`}>
                                    <input
                                        type={isMultiChoice ? 'checkbox' : 'radio'}
                                        checked={isCorrect}
                                        readOnly
                                        disabled
                                        className="w-5 h-5 disabled:opacity-100"
                                    />
                                    <span className="ml-3 font-medium">{optItem.opt}</span>

                                    {isCorrect && (
                                        <span className="ml-auto text-green-600 text-sm font-bold">✓ Correct Answer</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrialQuestionCard