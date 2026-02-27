import {useState, useEffect} from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import examService from '../services/exam'

const Result = ({notify}) => {
    const {submissionId} = useParams()
    const navigate = useNavigate()

    const [resultData, setResultData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchResult = async () => {
            if (!submissionId) {
                notify('Invalid result link.', 'error')
                navigate('/')
                return
            }
            try {
                const data = await examService.getResult(submissionId)
                setResultData(data)
            } catch (error) {
                notify('Failed to load results.', 'error')
                navigate('/')
            } finally {
                setIsLoading(false)
            }
        }
        fetchResult()
    }, [submissionId, navigate, notify])

    if (isLoading) return <div className="min-h-screen flex justify-center items-center font-semibold animate-pulse text-brand-600">📊 Loading Results...</div>
    if (!resultData) return null

    const questions = resultData.quizQuestions?.questions || []
    const studentAnswerList = resultData.studentAnswers?.questions || []
    const pointsPerQuestion = resultData.quizQuestions?.points || 0
    const maxScore = questions.filter(q => Array.isArray(q.options)).length * pointsPerQuestion

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 truncate">{resultData.quizTitle || 'Review'}</h1>
                        <p className="text-sm text-slate-500">Student: <span className="font-semibold text-slate-700">{resultData.studentName}</span></p>
                    </div>
                    <div className="bg-brand-50 border border-brand-200 px-6 py-2 rounded-lg text-center shadow-sm">
                        <span className="block text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">Final Score</span>
                        <span className="text-3xl font-extrabold text-brand-700">
                            {resultData.totalScore} <span className="text-xl text-brand-500">/ {maxScore}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed! 🎉</h2>
                    <p className="text-slate-500 text-lg">Detailed feedback and scoring per question are shown below.</p>
                </div>

                {questions.map((q, index) => {
                    const isText = q.itext !== undefined
                    const correctCount = q.options?.filter(opt => opt.correct === true || opt.correct === 'true').length || 0
                    const isMultiChoice = correctCount > 1

                    const studentAnsObj = studentAnswerList[index] || {}
                    const isMissed = isText ? (!studentAnsObj.answer) : (!studentAnsObj.selections?.length)

                    return (
                        <div key={index} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${isMissed ? 'border-red-400' : 'border-slate-200'}`}>
                            <div className={`px-6 py-4 border-b flex flex-col ${isMissed ? 'bg-red-50' : 'bg-slate-50'}`}>
                                <div className="flex gap-4">
                                    <span className={`font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit ${isMissed ? 'bg-red-100 text-red-700' : 'bg-brand-100 text-brand-700'}`}>Q {index + 1}</span>
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
                                                    <input type={isMultiChoice ? 'checkbox' : 'radio'} checked={isSelected} readOnly disabled className="w-5 h-5" />
                                                    <span className="ml-3 font-medium">{optItem.opt}</span>
                                                    {isCorrect && <span className="ml-auto text-green-600 text-sm font-bold">✓ Correct</span>}
                                                    {isSelected && !isCorrect && <span className="ml-auto text-red-500 text-sm font-bold">✗ Wrong</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="pt-4 pb-12 text-center">
                    <Link
                        to="/"
                        className="inline-block px-12 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full shadow-md transition-all active:scale-95"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Result