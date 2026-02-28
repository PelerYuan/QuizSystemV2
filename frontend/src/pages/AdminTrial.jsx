import {useState, useEffect} from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import quizService from '../services/quizzes'
import TrialQuestionCard from '../components/admin/trial/TrialQuestionCard'

const AdminTrial = ({notify}) => {
    const {quizId} = useParams()
    const navigate = useNavigate()
    const [quiz, setQuiz] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) {
                notify('Invalid quiz ID.', 'error')
                navigate('/admin/dashboard')
                return
            }
            try {
                const data = await quizService.getOne(quizId)
                setQuiz(data)
            } catch (error) {
                notify('Failed to load quiz details.', 'error')
                navigate('/admin/dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchQuiz()
    }, [quizId, navigate, notify])

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex justify-center items-center text-xl text-brand-600 font-semibold animate-pulse">
                Loading Preview...
            </div>
        )
    }

    if (!quiz || !quiz.questions) return null

    const quizData = quiz.questions
    const questionsList = quizData.questions || []
    const pointsPerQuestion = Number(quizData.points) || 1

    const maxScore = questionsList.filter(q => Array.isArray(q.options)).length * pointsPerQuestion

    return (
        <div className="bg-slate-50 min-h-screen pb-20 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div
                    className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 truncate flex items-center gap-2">
                            <span
                                className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs uppercase tracking-wide">Preview Mode</span>
                            {quiz.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {quizData.title} {quizData.subtitle ? `- ${quizData.subtitle}` : ''}
                        </p>
                    </div>
                    <div className="bg-brand-50 border border-brand-200 px-6 py-2 rounded-lg text-center shadow-sm">
                        <span className="block text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">Total Max Score</span>
                        <span className="text-3xl font-extrabold text-brand-700">{maxScore}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
                <div className="bg-amber-50 rounded-xl shadow-md border border-amber-200 p-6 text-center">
                    <h2 className="text-xl font-bold text-amber-800 mb-2">Teacher Reference Sheet</h2>
                    <p className="text-amber-700 text-sm">
                        This view is for verification only. All <span className="font-bold text-green-700">correct answers</span> are
                        automatically highlighted.
                    </p>
                </div>

                {questionsList.map((q, index) => (
                    <TrialQuestionCard
                        key={index}
                        q={q}
                        index={index}
                        pointsPerQuestion={pointsPerQuestion}
                    />
                ))}

                <div className="pt-4 pb-12 flex justify-center gap-4">
                    <Link
                        to="/admin/dashboard"
                        className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        to={`/admin/edit/${quizId}`}
                        className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full shadow-md transition-all active:scale-95"
                    >
                        Edit Quiz
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AdminTrial