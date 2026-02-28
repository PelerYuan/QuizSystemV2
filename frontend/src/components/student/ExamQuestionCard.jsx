const ExamQuestionCard = ({ q, index, currentAnswer, onAnswerChange, pointsPerQuestion }) => {
    const isText = q.itext !== undefined
    const isMultiChoice = q.isMultipleChoice === true

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-slate-50 px-6 py-4 border-b flex flex-col">
                <div className="flex gap-4">
                    <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit">
                        Q {index + 1}
                    </span>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">{q.Q}</h3>
                        <p className="text-xs text-brand-500 font-bold mt-2 uppercase tracking-wide">
                            {isText ? 'Subjective - Ungraded' : `${pointsPerQuestion} Points`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* 【新增】：图片渲染区域 */}
                {q.image && (
                    <div className="mb-6 flex justify-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <img
                            src={`/api/uploads/${q.image}`}
                            alt="Question Illustration"
                            className="max-h-80 w-auto object-contain rounded shadow-sm"
                        />
                    </div>
                )}

                {isText ? (
                    <textarea
                        value={currentAnswer || ''}
                        onChange={(e) => onAnswerChange(index, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 h-32 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-y"
                    />
                ) : (
                    <div className="space-y-3">
                        {q.options.map((optItem, optIdx) => {
                            const isChecked = isMultiChoice
                                ? (currentAnswer || []).includes(optItem.opt)
                                : currentAnswer === optItem.opt

                            return (
                                <label key={optIdx} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                                    isChecked ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                                }`}>
                                    <input
                                        type={isMultiChoice ? 'checkbox' : 'radio'}
                                        name={`q-${index}`}
                                        checked={isChecked}
                                        onChange={() => onAnswerChange(index, optItem.opt, isMultiChoice)}
                                        className="w-5 h-5 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="ml-3 text-slate-700 font-medium">{optItem.opt}</span>
                                </label>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExamQuestionCard