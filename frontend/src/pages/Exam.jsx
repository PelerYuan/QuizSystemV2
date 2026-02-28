import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import examService from '../services/exam'
import ExamQuestionCard from "../components/student/ExamQuestionCard.jsx";

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
                    return {answer: studentAns || ""}
                } else {
                    return {selections: Array.isArray(studentAns) ? studentAns : (studentAns ? [studentAns] : [])}
                }
            })

            const payload = {
                entranceId: examData.entranceId,
                studentName: studentName.trim(),
                answers: {questions: formattedQuestions}
            }

            const responseData = await examService.submitExam(payload)
            notify('Submitted successfully!', 'success')
            navigate(`/result/${responseData.submissionId}`)
        } catch (error) {
            notify(error.response?.data?.error || 'Submission failed.', 'error')
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div
        className="min-h-screen flex justify-center items-center font-semibold animate-pulse text-brand-600">⏳ Loading
        Assessment...</div>
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
                    <div className="bg-brand-500 h-1.5 transition-all duration-500"
                         style={{width: `${progress}%`}}></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
                {questions.map((q, index) => (
                    <ExamQuestionCard
                        key={index}
                        q={q}
                        index={index}
                        currentAnswer={answers[index]}
                        onAnswerChange={handleAnswerChange}
                        pointsPerQuestion={pointsPerQuestion}
                    />
                ))}

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