import {useState, useEffect} from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import examService from '../services/exam'
import ResultQuestionCard from "../components/student/ResultQuestionCard.jsx";

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

                {questions.map((q, index) => (
                    <ResultQuestionCard
                        key={index}
                        q={q}
                        index={index}
                        studentAnsObj={studentAnswerList[index] || {}}
                        pointsPerQuestion={pointsPerQuestion}
                    />
                ))}

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