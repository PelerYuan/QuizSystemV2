import {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import quizService from '../services/quizzes'
import entranceService from '../services/entrances'

const AdminDashboard = ({notify}) => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [entrances, setEntrances] = useState([])
    const [expandedQuizzes, setExpandedQuizzes] = useState({})
    const fileInputRef = useRef()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const fetchedQuizzes = await quizService.getAll()
            const fetchedEntrances = await entranceService.getAll()
            setQuizzes(fetchedQuizzes)
            setEntrances(fetchedEntrances)
        } catch (error) {
            console.error("Dashboard Fetch Error:", error)
            notify('Failed to load dashboard data. Please log in again.', 'error')
        }
    }

    // --- Quiz 相关操作 ---
    const handleCreateQuiz = () => {
        navigate('/admin/editor/new')
    }

    const handleDeleteQuiz = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the quiz "${name}"? This will also delete all associated exam sessions.`)) {
            try {
                await quizService.remove(id)
                // 修复：兼容 id 或 _id
                setQuizzes(quizzes.filter(q => (q.id || q._id) !== id))
                setEntrances(entrances.filter(e => {
                    const qId = e.quizId?.id || e.quizId?._id || e.quizId
                    return qId !== id
                }))
                notify(`Quiz "${name}" deleted.`, 'success')
            } catch (error) {
                notify('Failed to delete quiz.', 'error')
            }
        }
    }

    const handleImportJSON = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const parsedJSON = JSON.parse(e.target.result)
                if (!parsedJSON.name || !parsedJSON.questions) {
                    throw new Error("Invalid format: missing 'name' or 'questions'")
                }
                const newQuiz = await quizService.create(parsedJSON)
                setQuizzes(quizzes.concat(newQuiz))
                notify('Quiz imported successfully!', 'success')
            } catch (error) {
                notify(`Import failed: ${error.message}`, 'error')
            }
            event.target.value = ''
        }
        reader.readAsText(file)
    }

    // --- Entrance 相关操作 ---
    const handleCreateEntrance = async (quizId, quizName) => {
        try {
            const payload = {
                quizId: quizId,
                name: `${quizName} - Session`,
                isActive: true
            }
            const newEntrance = await entranceService.create(payload)
            setEntrances(entrances.concat(newEntrance))
            notify(`New exam session created! Access Code: ${newEntrance.accessCode}`, 'success')
        } catch (error) {
            notify('Failed to create exam session.', 'error')
        }
    }

    const handleDeleteEntrance = async (id, code) => {
        if (window.confirm(`Are you sure you want to delete session with code ${code}?`)) {
            try {
                await entranceService.remove(id)
                setEntrances(entrances.filter(e => (e.id || e._id) !== id))
                notify(`Session ${code} deleted.`, 'success')
            } catch (error) {
                notify('Failed to delete session.', 'error')
            }
        }
    }

    const copyToClipboard = (accessCode) => {
        const url = `${window.location.origin}/exam/${accessCode}`
        navigator.clipboard.writeText(url)
        notify(`Copied entrance link: ${url}`, 'success')
    }

    const toggleExpand = (quizId) => {
        setExpandedQuizzes(prev => ({
            ...prev,
            [quizId]: !prev[quizId]
        }))
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 font-sans pb-20">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
                    Admin Dashboard
                </h1>
                <div className="flex gap-4">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImportJSON}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow transition-colors"
                    >
                        📁 Import from JSON
                    </button>
                    <button
                        onClick={handleCreateQuiz}
                        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95"
                    >
                        ➕ Create Quiz
                    </button>
                </div>
            </div>

            {/* Quiz List */}
            <div className="space-y-4">
                {quizzes.length === 0 && (
                    <div
                        className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        No quizzes found. Create or import one to get started.
                    </div>
                )}

                {quizzes.map(quiz => {
                    // 修复：提取兼容的唯一标识符
                    const currentQuizId = quiz.id || quiz._id
                    const isExpanded = expandedQuizzes[currentQuizId]

                    const quizEntrances = entrances.filter(e => {
                        const qId = e.quizId?.id || e.quizId?._id || e.quizId
                        return qId === currentQuizId
                    })

                    return (
                        <div key={currentQuizId}
                             className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                            <div
                                className="flex flex-col md:flex-row justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(currentQuizId)}
                            >
                                <div className="flex items-center gap-3 w-full md:w-auto mb-4 md:mb-0">
                                    <span
                                        className={`text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                        ▶
                                    </span>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">{quiz.name}</h2>
                                        <p className="text-sm text-slate-500">{quizEntrances.length} exam sessions</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => navigate(`/admin/editor/${currentQuizId}`)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/trial/${currentQuizId}`)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded transition-colors"
                                    >
                                        Trial
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(currentQuizId, quiz.name)}
                                        className="flex-1 md:flex-none px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50 p-5 flex flex-col gap-3">
                                    {quizEntrances.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No active exam sessions for this
                                            quiz.</p>
                                    ) : (
                                        quizEntrances.map(entrance => {
                                            const currentEntId = entrance.id || entrance._id
                                            return (
                                                <div key={currentEntId}
                                                     className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">

                                                    <div className="w-full md:w-1/3 flex items-center gap-2">
                                                        <span
                                                            className={`w-3 h-3 rounded-full ${entrance.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                                        <span
                                                            className="font-semibold text-slate-700 truncate">{entrance.name}</span>
                                                    </div>

                                                    <div className="w-full md:w-1/3 text-center">
                                                        <span
                                                            className="bg-brand-50 border border-brand-200 text-brand-700 px-4 py-1.5 rounded-md font-mono font-bold text-lg tracking-[0.2em] shadow-inner">
                                                            {entrance.accessCode}
                                                        </span>
                                                    </div>

                                                    <div className="w-full md:w-1/3 flex justify-end gap-2">
                                                        <button
                                                            onClick={() => copyToClipboard(entrance.accessCode)}
                                                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded transition-colors"
                                                        >
                                                            Copy Link
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/result/${currentEntId}`)}
                                                            className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-bold rounded transition-colors"
                                                        >
                                                            Results
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEntrance(currentEntId, entrance.accessCode)}
                                                            className="px-3 py-1.5 border border-rose-200 text-rose-500 hover:bg-rose-50 text-sm font-bold rounded transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}

                                    <div className="mt-2 text-right">
                                        <button
                                            onClick={() => handleCreateEntrance(currentQuizId, quiz.name)}
                                            className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
                                        >
                                            + Generate New Access Code
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default AdminDashboard