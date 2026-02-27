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
    // Use an object to record temporary answers for easy updates: { 0: "A", 1: "Text" }
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
                const msg = error.response?.data?.error || 'Failed to load the exam. The link might be invalid or closed.'
                notify(msg, 'error')
                navigate('/')
            } finally {
                setIsLoading(false)
            }
        }
        fetchExam()
    }, [accessCode, navigate, notify])

    const questions = examData?.quiz?.questions?.questions || []
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
            notify('Please enter your name before submitting.', 'error')
            window.scrollTo({top: 0, behavior: 'smooth'})
            return
        }

        if (answeredCount < totalQuestions) {
            const confirmSubmit = window.confirm(`You have only answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`)
            if (!confirmSubmit) return
        }

        setIsSubmitting(true)

        try {
            // [Critical Fix 2]: Standardize the data payload strictly according to answer_format.md
            const formattedQuestions = questions.map((q, index) => {
                const isText = q.itext !== undefined // Flag for short answer questions
                const studentAns = answers[index]

                if (isText) {
                    return { answer: studentAns || "" } // Format for short answer
                } else {
                    // Selection format: Backend requires 'selections' to be an array for both single and multiple choice
                    const selectionsArray = Array.isArray(studentAns)
                        ? studentAns
                        : (studentAns ? [studentAns] : [])
                    return { selections: selectionsArray }
                }
            })

            const payload = {
                entranceId: examData.entranceId,
                studentName: studentName.trim(),
                answers: {
                    questions: formattedQuestions // Nested within the questions array
                }
            }

            const responseData = await examService.submitExam(payload)
            notify('Exam submitted successfully!', 'success')

            navigate(`/result/${responseData.submissionId}`)

        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to submit the exam. Please try again.'
            notify(msg, 'error')
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center text-xl text-brand-600 font-semibold animate-pulse">
                ⏳ Loading Assessment...
            </div>
        )
    }

    if (!examData) return null

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Progress bar */}
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 truncate">
                            {examData.quiz.questions.title}
                        </h1>
                        <p className="text-sm text-slate-500">Access Code: <span
                            className="font-mono">{accessCode}</span></p>
                    </div>
                    <div className="text-right">
                        <span className="text-brand-600 font-bold text-lg">{answeredCount}</span>
                        <span className="text-slate-400"> / {totalQuestions} Answered</span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5">
                    <div
                        className="bg-brand-500 h-1.5 transition-all duration-500 ease-out"
                        style={{width: `${progress}%`}}
                    ></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8 font-sans">
                {/* Student info */}
                <div className="bg-white rounded-xl shadow-md border border-brand-200 p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Student Information</h2>
                    <p className="text-slate-500 mb-6 text-sm">Please fill in your name to receive your final score.</p>
                    <div>
                        <label className="block font-semibold text-slate-700 mb-2">Full Name <span
                            className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full md:w-1/2 p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-slate-50"
                            required
                        />
                    </div>
                </div>

                {/* Questions */}
                {questions.map((q, index) => {
                    // Determine question type: presence of itext indicates short answer, options indicate multiple choice
                    const isText = q.itext !== undefined
                    const isMultiChoice = q.options && q.type === 'MULTIPLE_CHOICE'

                    return (
                        <div key={index} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex gap-4">
                                <span className="bg-brand-100 text-brand-700 font-bold px-3 py-1 rounded-full text-sm shrink-0 h-fit">
                                    Q {index + 1}
                                </span>
                                <h3 className="text-lg font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                                    {q.Q}
                                </h3>
                            </div>

                            <div className="p-6">
                                {isText ? (
                                    <textarea
                                        value={answers[index] || ''}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-4 h-32 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-y"
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        {q.options.map((optionItem, optIndex) => {
                                            // [Critical Fix 1]: Per specification, optionItem is { opt: "option content", correct: true/false }
                                            const optionText = optionItem.opt

                                            const isChecked = isMultiChoice
                                                ? (answers[index] || []).includes(optionText)
                                                : answers[index] === optionText

                                            return (
                                                <label
                                                    key={optIndex}
                                                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                                                        isChecked
                                                            ? 'border-brand-500 bg-brand-50'
                                                            : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type={isMultiChoice ? 'checkbox' : 'radio'}
                                                        name={`question-${index}`}
                                                        value={optionText} /* Replaced opt with optionText */
                                                        checked={isChecked}
                                                        onChange={() => handleAnswerChange(index, optionText, isMultiChoice)} /* Replaced opt with optionText */
                                                        className="w-5 h-5 text-brand-600 focus:ring-brand-500 border-slate-300"
                                                    />
                                                    <span className="ml-3 text-slate-700 text-base">{optionText}</span> {/* Replaced opt with optionText */}
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Submit */}
                <div className="pt-4 pb-12 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full md:w-auto md:px-16 py-4 rounded-full font-bold text-lg text-white transition-all shadow-md
                            ${isSubmitting
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-brand-500 hover:bg-brand-600 active:scale-95 hover:shadow-lg'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                    {answeredCount < totalQuestions && (
                        <p className="mt-4 text-amber-600 font-medium text-sm">
                            ⚠️ You have {totalQuestions - answeredCount} unanswered questions.
                        </p>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Exam