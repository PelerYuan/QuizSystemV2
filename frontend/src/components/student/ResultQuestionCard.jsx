const ResultQuestionCard = ({q, index, studentAnsObj, pointsPerQuestion}) => {
    const isText = q.itext !== undefined
    const correctCount = q.options?.filter(opt => opt.correct === true || opt.correct === 'true').length || 0
    const isMultiChoice = correctCount > 1

    const isMissed = isText ? (!studentAnsObj.answer) : (!studentAnsObj.selections?.length)

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${isMissed ? 'border-red-400' : 'border-slate-200'}`}>
            <div className={`px-6 py-4 border-b flex flex-col ${isMissed ? 'bg-red-50' : 'bg-slate-50'}`}>
                <div className="flex gap-4">
                    <span className={`font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit ${isMissed ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>
                        Q {index + 1}
                    </span>
                    <div className="w-full">
                        <h3 className="text-lg font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {q.Q}
                            {isMissed && <span className="ml-2 text-sm text-red-500 font-bold">(Missed)</span>}
                        </h3>

                        <div className="flex justify-between items-center mt-2 pr-4 border-t border-slate-200 pt-2">
                            <p className="text-xs text-brand-500 font-bold uppercase tracking-wide">
                                {isText ? 'Subjective - Ungraded' : `Max ${pointsPerQuestion} Points`}
                            </p>
                            {!isText && (
                                <p className={`text-sm font-bold ${studentAnsObj.point > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Earned: {studentAnsObj.point}
                                </p>
                            )}
                        </div>
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
                    <div className="w-full p-4 min-h-[8rem] rounded border bg-slate-50 text-slate-700 border-slate-200">
                        {studentAnsObj.answer || <span className="text-red-400 italic">No answer provided.</span>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {q.options.map((optItem, optIdx) => {
                            const isCorrect = optItem.correct === true || optItem.correct === 'true'
                            const isSelected = (studentAnsObj.selections || []).includes(optItem.opt)

                            let style = "border-slate-200 bg-white opacity-60"
                            if (isCorrect) style = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500"
                            else if (isSelected) style = "border-red-500 bg-red-50 text-red-800"

                            return (
                                <div key={optIdx} className={`flex items-center p-4 rounded-lg border ${style}`}>
                                    <input type={isMultiChoice ? 'checkbox' : 'radio'} checked={isSelected} readOnly
                                           disabled className="w-5 h-5"/>
                                    <span className="ml-3 font-medium">{optItem.opt}</span>
                                    {isCorrect &&
                                        <span className="ml-auto text-green-600 text-sm font-bold">✓ Correct</span>}
                                    {isSelected && !isCorrect &&
                                        <span className="ml-auto text-red-500 text-sm font-bold">✗ Wrong</span>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResultQuestionCard