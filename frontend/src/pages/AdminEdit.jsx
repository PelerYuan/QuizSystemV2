import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminEditForm } from "../hooks/useAdminEditForm.js";
import QuestionCard from "../components/admin/edit/QuestionCard.jsx";
import quizService from "../services/quizzes.js";
import { Hourglass, FilePlus, Pencil, Save } from 'lucide-react'

const AdminEdit = ({ notify }) => {
    const { quizId } = useParams()
    const navigate = useNavigate()

    const { quiz, handleMetaChange, actions } = useAdminEditForm()
    const [isLoading, setIsLoading] = useState(false)

    const titleRef = useRef(null)

    useEffect(() => {
        const fetchExistingQuiz = async () => {
            if (quizId === 'new') return

            try {
                setIsLoading(true)
                const fetchedData = await quizService.getOne(quizId)
                actions.loadFetchedQuiz(fetchedData)
            } catch (error) {
                console.error('Failed to fetch quiz', error)
                notify('Failed to load the quiz template. It might have been deleted.', 'error')
                navigate('/admin/dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchExistingQuiz()
    }, [quizId])

    const validateForm = () => {
        if (!quiz.title || !quiz.title.trim()) {
            notify('Quiz title is required.', 'error')
            titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            titleRef.current?.focus()
            return false
        }

        if (!quiz.questions || quiz.questions.length === 0) {
            notify('Please add at least one question to the quiz.', 'error')
            return false
        }

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i]
            const qElement = document.getElementById(`question-${i}`) // 获取 QuestionCard 绑定的 id

            if (!q.Q || !q.Q.trim()) {
                notify(`Question ${i + 1} text cannot be empty.`, 'error')
                qElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                return false
            }

            if (q.uiType !== 'TEXT') {
                if (!q.options || q.options.length < 2) {
                    notify(`Question ${i + 1} must have at least 2 options.`, 'error')
                    qElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    return false
                }

                const hasEmptyOption = q.options.some(opt => !opt.opt || !opt.opt.trim())
                if (hasEmptyOption) {
                    notify(`Question ${i + 1} has an empty option.`, 'error')
                    qElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    return false
                }

                const hasCorrectAnswer = q.options.some(opt => opt.correct === true || opt.correct === 'true')
                if (!hasCorrectAnswer) {
                    notify(`Question ${i + 1} must have at least one correct answer selected.`, 'error')
                    qElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    return false
                }
            }
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        const payload = {
            name: quiz.title,
            description: quiz.description,
            questions: {
                title: quiz.title,
                subtitle: quiz.subtitle,
                points: Number(quiz.points),
                questions: quiz.questions.map(q => {
                    const formattedQ = { Q: q.Q }
                    if (q.image) formattedQ.image = q.image

                    if (q.uiType === 'TEXT') {
                        formattedQ.itext = ''
                    } else {
                        formattedQ.options = q.options.map(opt => ({
                            ...opt,
                            correct: opt.correct === true || opt.correct === 'true'
                        }))
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
            <div className="min-h-[60vh] flex justify-center items-center text-xl text-brand-600 font-semibold animate-pulse">
                <Hourglass className="w-6 h-6 inline-block mr-2" /> Loading Quiz Editor...
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans pb-24 mt-4">

            {/* Dynamic Title */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-brand-900 tracking-tight flex items-center">
                    {quizId === 'new' ? <>Create New Quiz</> : <>Edit Quiz Template</>}
                </h2>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>

            {/* 1. Quiz Metadata Section */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 mb-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-500"></div>
                <h3 className="text-xl font-bold text-slate-800 mt-0 mb-6">General Information</h3>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Quiz Title <span className="text-red-500">*</span></label>
                        <input
                            ref={titleRef}
                            name="title"
                            value={quiz.title}
                            onChange={handleMetaChange}
                            placeholder="e.g. Python Fundamentals"
                            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-slate-50 hover:bg-white focus:bg-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Subtitle</label>
                        <input
                            name="subtitle"
                            value={quiz.subtitle}
                            onChange={handleMetaChange}
                            placeholder="e.g. Term 1 Assessment"
                            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-slate-50 hover:bg-white focus:bg-white"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="grow-2">
                        <label className="block font-semibold text-slate-700 mb-2">Internal Description</label>
                        <textarea
                            name="description"
                            value={quiz.description}
                            onChange={handleMetaChange}
                            placeholder="Optional notes for other teachers..."
                            className="w-full p-3 h-12 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-y bg-slate-50 hover:bg-white focus:bg-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-semibold text-slate-700 mb-2">Points per Question <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="points"
                            min="0"
                            step="0.5"
                            value={quiz.points}
                            onChange={handleMetaChange}
                            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow bg-slate-50 hover:bg-white focus:bg-white"
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
                className="w-full p-6 mt-6 bg-slate-50 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl text-lg font-bold transition-all hover:bg-brand-50 hover:border-brand-400 hover:text-brand-600 hover:shadow-inner active:scale-[0.99] flex justify-center items-center gap-2"
            >
                <span className="text-2xl leading-none">+</span> Add New Question
            </button>

            {/* 4. Sticky Footer Submit Action */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="px-10 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-md hover:shadow-lg font-extrabold text-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save className="w-5 h-5 mr-1" /> {quizId === 'new' ? 'Save & Create Quiz' : 'Save Changes'}
                    </button>
                </div>
            </div>

        </div>
    )
}

export default AdminEdit