import {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import quizService from '../services/quizzes'
import entranceService from '../services/entrances'
import CreateEntranceDialog from '../components/dialogs/CreateEntranceDialog'
import ConfirmDialog from '../components/dialogs/ConfirmDialog'
import QuizItem from '../components/admin/dashboard/QuizItem'

import {useModal} from '../hooks/useModal'

const AdminDashboard = ({notify}) => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [entrances, setEntrances] = useState([])
    const [expandedQuizzes, setExpandedQuizzes] = useState({})
    const fileInputRef = useRef()

    const createEntranceModal = useModal({quizId: null, quizName: ''})
    const deleteQuizModal = useModal({targetId: null, targetName: ''})
    const deleteEntranceModal = useModal({targetId: null, targetCode: ''})

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
            notify('Failed to load dashboard data. Please log in again.', 'error')
        }
    }

    const handleCreateQuiz = () => navigate('/admin/edit/new')

    const executeDeleteQuiz = async () => {
        const {targetId: id, targetName: name} = deleteQuizModal.data
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
            deleteQuizModal.close()
        }
    }

    const handleImportJSON = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const parsedJSON = JSON.parse(e.target.result)
                if (!parsedJSON.title || !parsedJSON.questions) {
                    throw new Error("Invalid format: missing 'title' or 'questions'")
                }
                const payload = {
                    name: parsedJSON.title,
                    description: parsedJSON.description || '',
                    questions: parsedJSON
                }
                const newQuiz = await quizService.create(payload)
                setQuizzes(quizzes.concat(newQuiz))
                notify('Quiz imported successfully!', 'success')
            } catch (error) {
                notify(`Import failed: ${error.message}`, 'error')
            }
            event.target.value = ''
        }
        reader.readAsText(file)
    }

    const executeCreateEntrance = async (name, description) => {
        try {
            const newEntrance = await entranceService.create({
                quizId: createEntranceModal.data.quizId,
                name,
                description,
                isActive: true
            })
            setEntrances(entrances.concat(newEntrance))
            notify(`New exam session created! Access Code: ${newEntrance.accessCode}`, 'success')
        } catch (error) {
            notify('Failed to create exam session.', 'error')
        }
    }

    const executeDeleteEntrance = async () => {
        const {targetId: id, targetCode: code} = deleteEntranceModal.data
        try {
            await entranceService.remove(id)
            setEntrances(entrances.filter(e => (e.id || e._id) !== id))
            notify(`Session ${code} deleted.`, 'success')
        } catch (error) {
            notify('Failed to delete session.', 'error')
        } finally {
            deleteEntranceModal.close()
        }
    }

    const handleToggleActive = async (entrance) => {
        const currentEntId = entrance.id || entrance._id
        try {
            const updatedEntrance = await entranceService.update(currentEntId, {isActive: !entrance.isActive})
            setEntrances(entrances.map(e => (e.id || e._id) === currentEntId ? updatedEntrance : e))
            notify(`Session is now ${updatedEntrance.isActive ? 'Active' : 'Closed'}`, 'success')
        } catch (error) {
            notify('Failed to update session status.', 'error')
        }
    }

    const copyLinkToClipboard = (entrance) => {
        if (!entrance.isActive) return notify(`Session is inactive.`, 'warning')
        navigator.clipboard.writeText(`${window.location.origin}/exam/${entrance.accessCode}`)
        notify(`Copied entrance link to clipboard`, 'success')
    }

    const copyCodeToClipboard = (entrance) => {
        if (!entrance.isActive) return notify(`Session is inactive.`, 'warning')
        navigator.clipboard.writeText(entrance.accessCode)
        notify(`Copied Access Code: ${entrance.accessCode}`, 'success')
    }

    const toggleExpand = (quizId) => setExpandedQuizzes(prev => ({...prev, [quizId]: !prev[quizId]}))

    const entranceActions = {
        onDelete: (id, code) => deleteEntranceModal.open({targetId: id, targetCode: code}),
        onToggleActive: handleToggleActive,
        onCopyLink: copyLinkToClipboard,
        onCopyCode: copyCodeToClipboard
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 font-sans pb-20">
            <CreateEntranceDialog
                isOpen={createEntranceModal.isOpen}
                onClose={createEntranceModal.close}
                onSubmit={executeCreateEntrance}
                quizName={createEntranceModal.data.quizName}
            />

            <ConfirmDialog
                isOpen={deleteQuizModal.isOpen}
                onClose={deleteQuizModal.close}
                onConfirm={executeDeleteQuiz}
                title="Delete Quiz"
                message={`Are you sure you want to delete "${deleteQuizModal.data.targetName}"?`}
                confirmText="Delete Permanently"
                isDanger={true}
            />

            <ConfirmDialog
                isOpen={deleteEntranceModal.isOpen}
                onClose={deleteEntranceModal.close}
                onConfirm={executeDeleteEntrance}
                title="Delete Session"
                message={`Delete session ${deleteEntranceModal.data.targetCode}?`}
                confirmText="Delete Session"
                isDanger={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON}
                           className="hidden"/>
                    <button onClick={() => fileInputRef.current.click()}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow">📁
                        Import
                    </button>
                    <button onClick={handleCreateQuiz}
                            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-md">➕
                        Create Quiz
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {quizzes.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed">No
                        quizzes found.</div>
                )}
                {quizzes.map(quiz => {
                    const currentQuizId = quiz.id || quiz._id
                    const quizEntrances = entrances.filter(e => {
                        const qId = e.quizId?.id || e.quizId?._id || e.quizId
                        return qId === currentQuizId
                    })

                    return (
                        <QuizItem
                            key={currentQuizId}
                            quiz={quiz}
                            entrances={quizEntrances}
                            isExpanded={expandedQuizzes[currentQuizId]}
                            onToggleExpand={toggleExpand}
                            onDeleteQuiz={(id, name) => deleteQuizModal.open({targetId: id, targetName: name})}
                            onOpenCreateEntrance={(id, name) => createEntranceModal.open({quizId: id, quizName: name})}
                            entranceActions={entranceActions}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default AdminDashboard