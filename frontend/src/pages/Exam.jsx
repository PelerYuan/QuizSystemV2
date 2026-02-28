import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import examService from '../services/exam'
import ExamQuestionCard from "../components/student/ExamQuestionCard.jsx"
import ConfirmDialog from '../components/dialogs/ConfirmDialog'
import { Hourglass } from 'lucide-react'

import {useModal} from '../hooks/useModal'

const Exam = ({notify}) => {
    const {accessCode} = useParams()
    const navigate = useNavigate()

    const [examData, setExamData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [studentName, setStudentName] = useState('')
    const [answers, setAnswers] = useState({})

    const confirmSubmitModal = useModal()

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

    const handleInitialSubmit = (e) => {
        e.preventDefault()
        if (!studentName.trim()) {
            notify('Please enter your name.', 'error')
            window.scrollTo({top: 0, behavior: 'smooth'})
            return
        }

        if (answeredCount < totalQuestions) {
            confirmSubmitModal.open()
            return
        }

        executeSubmit()
    }

    const executeSubmit = async () => {
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
        className="min-h-screen flex justify-center items-center font-semibold animate-pulse text-brand-600"><Hourglass className="w-5 h-5 inline-block mr-2" /> Loading
        Assessment...</div>
    if (!examData) return null

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">

            <ConfirmDialog
                isOpen={confirmSubmitModal.isOpen}
                onClose={confirmSubmitModal.close}
                onConfirm={executeSubmit}
                title="Incomplete Assessment"
                message={`You missed ${totalQuestions - answeredCount} questions. Are you sure you want to submit anyway?`}
                confirmText="Submit Anyway"
                isDanger={true}
            />

            <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
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

                <div className="bg-white rounded-xl shadow-md border border-brand-200 p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Student Information</h2>
                    <p className="text-sm text-slate-500 mb-6">Please enter your full name before starting the
                        assessment.</p>
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full md:w-1/2 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 hover:bg-white transition-colors"
                        required
                        autoFocus
                    />
                </div>

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
                        onClick={handleInitialSubmit}
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