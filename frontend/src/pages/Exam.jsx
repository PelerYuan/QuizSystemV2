import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import examService from '../services/exam'

const Exam = ({notify}) => {
    const {accessCode} = useParams()
    const navigate = useNavigate()

    const [examData, setExamData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [studentName, setStudentName] = useState('')
    const [answers, setAnswers] = useState({})

    useEffect(() => {
        const fetchExam = async () => {
            if (!accessCode) {
                notify('Invalid exam link. Missing access code.', 'error')
                navigate('/')
                return
            }
            try {
                const data = await examService.getEntrance(accessCode)
                setExamData(data)
            } catch (error) {
                notify(error.response?.data?.error || 'Failed to load the exam.', 'error')
                navigate('/')
            } finally {
                setIsLoading(false)
            }
        }
        fetchExam()
    }, [accessCode, navigate, notify])

    const questions = examData?.quiz?.questions?.questions || []
    const pointsPerQuestion = examData?.quiz?.questions?.points || 0
    const totalQuestions = questions.length
    const answeredCount = Object.keys(answers).length
    const progress = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)

    const handleAnswerChange = (qIndex, value, isMultiChoice = false) => {
        setAnswers(prev => {
            if (!isMultiChoice) {
                return {...prev, [qIndex]: value}
            }
            const currentAnswers = prev[qIndex] || []
            if (currentAnswers.includes(value)) {
                return {...prev, [qIndex]: currentAnswers.filter(v => v !== value)}
            } else {
                return {...prev, [qIndex]: [...currentAnswers, value]}
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!studentName.trim()) {
            notify('Please enter your name.', 'error')
            window.scrollTo({top: 0, behavior: 'smooth'})
            return
        }
        if (answeredCount < totalQuestions) {
            const confirmSubmit = window.confirm(`You missed ${totalQuestions - answeredCount} questions. Submit anyway?`)
            if (!confirmSubmit) return
        }

        setIsSubmitting(true)
        try {
            const formattedQuestions = questions.map((q, index) => {
                const studentAns = answers[index]
                if (q.itext !== undefined) {
                    return { answer: studentAns || "" }
                } else {
                    return { selections: Array.isArray(studentAns) ? studentAns : (studentAns ? [studentAns] : []) }
                }
            })

            const payload = {
                entranceId: examData.entranceId,
                studentName: studentName.trim(),
                answers: { questions: formattedQuestions }
            }

            const responseData = await examService.submitExam(payload)
            notify('Submitted successfully!', 'success')
            navigate(`/result/${responseData.submissionId}`)
        } catch (error) {
            notify(error.response?.data?.error || 'Submission failed.', 'error')
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="min-h-screen flex justify-center items-center font-semibold animate-pulse text-brand-600">⏳ Loading Assessment...</div>
    if (!examData) return null

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 truncate">{examData.quiz.questions.title}</h1>
                        <p className="text-sm text-slate-500">Code: <span className="font-mono">{accessCode}</span></p>
                    </div>
                    <div className="text-right">
                        <span className="text-brand-600 font-bold text-lg">{answeredCount}</span>
                        <span className="text-slate-400"> / {totalQuestions}</span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5">
                    <div className="bg-brand-500 h-1.5 transition-all duration-500" style={{width: `${progress}%`}}></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
                <div className="bg-white rounded-xl shadow-md border border-brand-200 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Student Information</h2>
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full md:w-1/2 p-3 rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50"
                        required
                        autoFocus
                    />
                </div>

                {questions.map((q, index) => {
                    const isText = q.itext !== undefined
                    const isMultiChoice = q.isMultiChoice === true

                    return (
                        <div key={index} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-slate-50 px-6 py-4 border-b flex flex-col">
                                <div className="flex gap-4">
                                    <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit">Q {index + 1}</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">{q.Q}</h3>
                                        <p className="text-xs text-brand-500 font-bold mt-2 uppercase tracking-wide">
                                            {isText ? 'Subjective - Ungraded' : `${pointsPerQuestion} Points`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {isText ? (
                                    <textarea
                                        value={answers[index] || ''}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 h-32 rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none resize-y"
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        {q.options.map((optItem, optIdx) => (
                                            <label key={optIdx} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                                                (isMultiChoice ? (answers[index] || []).includes(optItem.opt) : answers[index] === optItem.opt)
                                                    ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                                            }`}>
                                                <input
                                                    type={isMultiChoice ? 'checkbox' : 'radio'}
                                                    name={`q-${index}`}
                                                    checked={isMultiChoice ? (answers[index] || []).includes(optItem.opt) : answers[index] === optItem.opt}
                                                    onChange={() => handleAnswerChange(index, optItem.opt, isMultiChoice)}
                                                    className="w-5 h-5 text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="ml-3 text-slate-700">{optItem.opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="pt-4 pb-12 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full md:w-auto md:px-16 py-4 rounded-full font-bold text-lg text-white transition-all shadow-md ${
                            isSubmitting ? 'bg-slate-400' : 'bg-brand-500 hover:bg-brand-600 active:scale-95'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Exam