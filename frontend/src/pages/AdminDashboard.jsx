import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import quizService from '../services/quizzes'
import entranceService from '../services/entrances'
import CreateEntranceDialog from '../components/dialogs/CreateEntranceDialog'
import ConfirmDialog from '../components/dialogs/ConfirmDialog'

const AdminDashboard = ({ notify }) => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [entrances, setEntrances] = useState([])
    const [expandedQuizzes, setExpandedQuizzes] = useState({})
    const fileInputRef = useRef()

    const [createModal, setCreateModal] = useState({ isOpen: false, quizId: null, quizName: '' })
    const [deleteQuizModal, setDeleteQuizModal] = useState({ isOpen: false, targetId: null, targetName: '' })
    const [deleteEntranceModal, setDeleteEntranceModal] = useState({ isOpen: false, targetId: null, targetCode: '' })

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

    const handleCreateQuiz = () => navigate('/admin/editor/new')

    const triggerDeleteQuiz = (id, name) => {
        setDeleteQuizModal({ isOpen: true, targetId: id, targetName: name })
    }

    const executeDeleteQuiz = async () => {
        const { targetId: id, targetName: name } = deleteQuizModal
        try {
            await quizService.remove(id)
            setQuizzes(quizzes.filter(q => (q.id || q._id) !== id))
            setEntrances(entrances.filter(e => {
                const qId = e.quizId?.id || e.quizId?._id || e.quizId
                return qId !== id
            }))
            notify(`Quiz "${name}" deleted.`, 'success')
        } catch (error) {
            notify('Failed to delete quiz.', 'error')
        } finally {
            setDeleteQuizModal({ isOpen: false, targetId: null, targetName: '' })
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

    const openCreateEntranceModal = (quizId, quizName) => {
        setCreateModal({ isOpen: true, quizId, quizName })
    }

    const executeCreateEntrance = async (name, description) => {
        try {
            const payload = {
                quizId: createModal.quizId,
                name: name,
                description: description,
                isActive: true
            }
            const newEntrance = await entranceService.create(payload)
            setEntrances(entrances.concat(newEntrance))
            notify(`New exam session created! Access Code: ${newEntrance.accessCode}`, 'success')
        } catch (error) {
            notify('Failed to create exam session.', 'error')
        }
    }

    const triggerDeleteEntrance = (id, code) => {
        setDeleteEntranceModal({ isOpen: true, targetId: id, targetCode: code })
    }

    const executeDeleteEntrance = async () => {
        const { targetId: id, targetCode: code } = deleteEntranceModal
        try {
            await entranceService.remove(id)
            setEntrances(entrances.filter(e => (e.id || e._id) !== id))
            notify(`Session ${code} deleted.`, 'success')
        } catch (error) {
            notify('Failed to delete session.', 'error')
        } finally {
            setDeleteEntranceModal({ isOpen: false, targetId: null, targetCode: '' })
        }
    }

    const handleToggleActive = async (entrance) => {
        const currentEntId = entrance.id || entrance._id
        try {
            const updatedEntrance = await entranceService.update(currentEntId, { isActive: !entrance.isActive })
            setEntrances(entrances.map(e => (e.id || e._id) === currentEntId ? updatedEntrance : e))
            notify(`Session ${updatedEntrance.name} is now ${updatedEntrance.isActive ? 'Active' : 'Closed'}`, 'success')
        } catch (error) {
            notify('Failed to update session status.', 'error')
        }
    }

    const copyLinkToClipboard = (entrance) => {
        if (!entrance.isActive) {
            notify(`Session is inactive. Students cannot use this link right now.`, 'warning')
            return
        }
        const url = `${window.location.origin}/exam/${entrance.accessCode}`
        navigator.clipboard.writeText(url)
        notify(`Copied entrance link to clipboard`, 'success')
    }

    const copyCodeToClipboard = (entrance) => {
        if (!entrance.isActive) {
            notify(`Session is inactive. Students cannot use this code right now.`, 'warning')
            return
        }
        navigator.clipboard.writeText(entrance.accessCode)
        notify(`Copied Access Code: ${entrance.accessCode}`, 'success')
    }

    const toggleExpand = (quizId) => {
        setExpandedQuizzes(prev => ({
            ...prev,
            [quizId]: !prev[quizId]
        }))
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 font-sans pb-20">
            <CreateEntranceDialog
                isOpen={createModal.isOpen}
                onClose={() => setCreateModal({ isOpen: false, quizId: null, quizName: '' })}
                onSubmit={executeCreateEntrance}
                quizName={createModal.quizName}
            />

            <ConfirmDialog
                isOpen={deleteQuizModal.isOpen}
                onClose={() => setDeleteQuizModal({ isOpen: false, targetId: null, targetName: '' })}
                onConfirm={executeDeleteQuiz}
                title="Delete Quiz"
                message={`Are you sure you want to delete the quiz "${deleteQuizModal.targetName}"? This action cannot be undone and will erase all associated exam sessions and student records.`}
                confirmText="Delete Permanently"
                isDanger={true}
            />

            <ConfirmDialog
                isOpen={deleteEntranceModal.isOpen}
                onClose={() => setDeleteEntranceModal({ isOpen: false, targetId: null, targetCode: '' })}
                onConfirm={executeDeleteEntrance}
                title="Delete Exam Session"
                message={`Are you sure you want to delete the session with code ${deleteEntranceModal.targetCode}? This will permanently remove all student submissions for this session.`}
                confirmText="Delete Session"
                isDanger={true}
            />

            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
                    Admin Dashboard
                </h1>
                <div className="flex gap-4">
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow transition-colors"
                    >
                        📁 Import from JSON
                    </button>
                    <button
                        onClick={handleCreateQuiz}
                        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
                    >
                        ➕ Create Quiz
                    </button>
                </div>
            </div>

            {/* Quiz List */}
            <div className="space-y-4">
                {quizzes.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        No quizzes found. Create or import one to get started.
                    </div>
                )}

                {quizzes.map(quiz => {
                    const currentQuizId = quiz.id || quiz._id
                    const isExpanded = expandedQuizzes[currentQuizId]
                    const quizEntrances = entrances.filter(e => {
                        const qId = e.quizId?.id || e.quizId?._id || e.quizId
                        return qId === currentQuizId
                    })

                    return (
                        <div key={currentQuizId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                            <div
                                className="flex flex-col lg:flex-row justify-between items-center p-5 cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                                onClick={() => toggleExpand(currentQuizId)}
                            >
                                <div className="flex items-start gap-3 w-full lg:w-auto lg:flex-1 min-w-0">
                                    <span className={`mt-1 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                        ▶
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-slate-800 truncate">{quiz.name}</h2>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                            {quiz.description || <span className="italic text-slate-400">No description provided.</span>}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">{quizEntrances.length} exam sessions</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full lg:w-auto flex-none" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => triggerDeleteQuiz(currentQuizId, quiz.name)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded transition-colors whitespace-nowrap"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/editor/${currentQuizId}`)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded transition-colors whitespace-nowrap"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/trial/${currentQuizId}`)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded transition-colors whitespace-nowrap"
                                    >
                                        Trial
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50 p-5 flex flex-col gap-3">
                                    {quizEntrances.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No active exam sessions for this quiz.</p>
                                    ) : (
                                        quizEntrances.map(entrance => {
                                            const currentEntId = entrance.id || entrance._id

                                            const cardStyle = entrance.isActive
                                                ? "bg-white border-slate-200 hover:border-brand-300 shadow-sm"
                                                : "bg-slate-100 border-slate-200 opacity-75 grayscale-[20%]"

                                            return (
                                                <div key={currentEntId} className={`flex flex-col lg:flex-row justify-between items-center p-4 rounded-lg border gap-4 transition-all ${cardStyle}`}>

                                                    {/* Left: Entrance Info */}
                                                    <div className="w-full lg:w-auto lg:flex-1 flex flex-col gap-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-3 h-3 rounded-full shrink-0 shadow-inner ${entrance.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                            <span className={`font-semibold truncate ${entrance.isActive ? 'text-slate-700' : 'text-slate-500 line-through decoration-slate-300'}`}>
                                                                {entrance.name}
                                                            </span>
                                                        </div>
                                                        <div className="pl-5 text-xs text-slate-500 line-clamp-1">
                                                            {entrance.description || <span className="italic text-slate-400">No description provided.</span>}
                                                        </div>
                                                    </div>

                                                    {/* Middle: Access Code */}
                                                    <div className="w-full lg:w-auto flex-none flex justify-center">
                                                        <button
                                                            onClick={() => copyCodeToClipboard(entrance)}
                                                            title={entrance.isActive ? "Click to copy Code" : "Inactive - Cannot copy"}
                                                            className={`border px-6 py-1.5 rounded-md font-mono font-bold text-lg tracking-[0.2em] shadow-inner transition-colors flex items-center gap-2
                                                                ${entrance.isActive
                                                                ? 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 hover:border-brand-300 active:scale-95'
                                                                : 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'}`}
                                                        >
                                                            {entrance.accessCode}
                                                            <span className={`${entrance.isActive ? 'text-brand-400' : 'text-slate-400'} text-xs tracking-normal font-sans`}>📋</span>
                                                        </button>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div className="w-full lg:w-auto flex-none flex justify-end gap-2 overflow-x-auto pb-2 lg:pb-0">
                                                        <button
                                                            onClick={() => triggerDeleteEntrance(currentEntId, entrance.accessCode)}
                                                            className="px-3 py-1.5 border border-rose-200 text-rose-500 hover:bg-rose-50 text-sm font-bold rounded transition-colors whitespace-nowrap"
                                                        >
                                                            Delete
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggleActive(entrance)}
                                                            className={`px-3 py-1.5 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                                                                entrance.isActive
                                                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                                                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                                            }`}
                                                        >
                                                            {entrance.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>

                                                        <button
                                                            onClick={() => navigate(`/admin/result/${currentEntId}`)}
                                                            className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-bold rounded transition-colors whitespace-nowrap"
                                                        >
                                                            Results
                                                        </button>

                                                        <button
                                                            onClick={() => copyLinkToClipboard(entrance)}
                                                            className={`px-3 py-1.5 text-sm font-bold rounded transition-colors whitespace-nowrap
                                                                ${entrance.isActive
                                                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                                                        >
                                                            Copy Link
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}

                                    <div className="mt-2 text-right">
                                        <button
                                            onClick={() => openCreateEntranceModal(currentQuizId, quiz.name)}
                                            className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors px-4 py-2 hover:bg-brand-50 rounded-lg inline-flex items-center gap-1"
                                        >
                                            <span className="text-lg leading-none">+</span> Generate New Access Code
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