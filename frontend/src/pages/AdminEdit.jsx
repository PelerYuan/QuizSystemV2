// src/pages/AdminEdit.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminEditForm } from "../hooks/useAdminEditForm.js";
import QuestionCard from "../components/admin/edit/questionCard.jsx"; // Note: You will likely need to refactor QuestionCard with Tailwind later
import quizService from "../services/quizzes.js";

const QuizEditor = ({ notify }) => {
    const { quizId } = useParams()
    const navigate = useNavigate()

    const { quiz, handleMetaChange, actions } = useAdminEditForm()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchExistingQuiz = async () => {
            if (quizId === 'new') return

            try {
                setIsLoading(true)
                const fetchedData = await quizService.getOne(quizId)
                actions.loadFetchedQuiz(fetchedData)
            } catch (error) {
                console.error('Failed to fetch quiz', error)
                // Replaced native alert with elegant notify
                notify('Failed to load the quiz template. It might have been deleted.', 'error')
                navigate('/admin/dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchExistingQuiz()
    }, [quizId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            name: quiz.title,
            description: quiz.description,
            questions: {
                title: quiz.title,
                subtitle: quiz.subtitle,
                points: Number(quiz.points),
                questions: quiz.questions.map(q => {
                    const formattedQ = { Q: q.Q }
                    if (q.uiType === 'TEXT') {
                        formattedQ.itext = ''
                    } else {
                        formattedQ.options = q.options
                    }
                    return formattedQ
                })
            }
        }

        try {
            if (quizId === 'new') {
                await quizService.create(payload)
                notify('Quiz created successfully!', 'success')
            } else {
                await quizService.update(quizId, payload)
                notify('Quiz updated successfully!', 'success')
            }
            navigate('/admin/dashboard')
        } catch (error) {
            console.error('Submit failed', error)
            notify('Failed to save the quiz. Please try again.', 'error')
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center mt-20 text-xl text-brand-600 font-semibold animate-pulse">
                ⏳ Loading Quiz Editor...
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans">

            {/* Dynamic Title */}
            <h2 className="text-3xl font-bold text-brand-900 mb-8 flex items-center gap-2">
                {quizId === 'new' ? '📝 Create New Quiz Template' : '✏️ Edit Quiz Template'}
            </h2>

            {/* 1. Quiz Metadata Section */}
            <div className="border-t-4 border-brand-500 shadow-lg p-8 mb-10 bg-white rounded-b-xl">
                <h3 className="text-xl font-bold text-slate-800 mt-0 mb-6">Quiz Information</h3>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Title *</label>
                        <input
                            name="title"
                            value={quiz.title}
                            onChange={handleMetaChange}
                            className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Subtitle</label>
                        <input
                            name="subtitle"
                            value={quiz.subtitle}
                            onChange={handleMetaChange}
                            className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-2">
                        <label className="block font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={quiz.description}
                            onChange={handleMetaChange}
                            className="w-full p-3 h-24 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-y"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Points per Question *</label>
                        <input
                            type="number"
                            name="points"
                            value={quiz.points}
                            onChange={handleMetaChange}
                            className="w-full p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Questions Rendering Section */}
            <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                    <QuestionCard
                        key={index}
                        question={q}
                        qIndex={index}
                        actions={actions}
                    />
                ))}
            </div>

            {/* 3. Add Question Button */}
            <button
                onClick={actions.addQuestion}
                className="w-full p-4 mt-6 bg-slate-50 border-2 border-dashed border-brand-400 text-brand-600 rounded-xl text-lg font-bold cursor-pointer mb-8 transition-colors hover:bg-brand-50 hover:border-brand-500"
            >
                ＋ Add Question
            </button>

            {/* 4. Submit Button */}
            <div className="text-right border-t border-slate-200 pt-6">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg shadow-md font-bold text-lg cursor-pointer active:scale-95 transition-all"
                >
                    {quizId === 'new' ? '💾 Save New Quiz' : '💾 Update Quiz'}
                </button>
            </div>

        </div>
    )
}

export default QuizEditor