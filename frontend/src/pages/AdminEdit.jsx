import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminEditForm} from "../hooks/useAdminEditForm.js";
import QuestionCard from "../components/admin/edit/questionCard.jsx";
import quizService from "../services/quizzes.js";

const QuizEditor = () => {
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
                alert('Failed to load the quiz template. It might have been deleted.')
                navigate('/admin/dashboard')
            } finally {
                setIsLoading(false)
            }
        }

        fetchExistingQuiz()
    }, [quizId, navigate, actions])

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
                alert('Quiz created successfully!')
            } else {
                await quizService.update(quizId, payload)
                alert('Quiz updated successfully!')
            }
            navigate('/admin/dashboard')
        } catch (error) {
            console.error('Submit failed', error)
            alert('Failed to save the quiz. Please check your connection and try again.')
        }
    }

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px' }}>⏳ Loading Quiz Editor...</div>
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

            {/* Dynamic Title */}
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
                {quizId === 'new' ? '📝 Create New Quiz Template' : '✏️ Edit Quiz Template'}
            </h2>

            {/* 1. Quiz Metadata Section */}
            <div style={{ borderTop: '4px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '30px', backgroundColor: 'white', borderRadius: '0 0 8px 8px' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Quiz Information</h3>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label><b>Title *</b></label>
                        <input name="title" value={quiz.title} onChange={handleMetaChange} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label><b>Subtitle *</b></label>
                        <input name="subtitle" value={quiz.subtitle} onChange={handleMetaChange} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 2 }}>
                        <label><b>Description *</b></label>
                        <textarea name="description" value={quiz.description} onChange={handleMetaChange} style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label><b>Points per Question *</b></label>
                        <input type="number" name="points" value={quiz.points} onChange={handleMetaChange} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                </div>
            </div>

            {/* 2. Questions Rendering Section */}
            {quiz.questions.map((q, index) => (
                <QuestionCard
                    key={index}
                    question={q}
                    qIndex={index}
                    actions={actions}
                />
            ))}

            {/* 3. Add Question Button */}
            <button
                onClick={actions.addQuestion}
                style={{ width: '100%', padding: '15px', backgroundColor: '#f8f9fa', border: '2px dashed #007bff', color: '#007bff', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            >
                ＋ Add Question
            </button>

            {/* 4. Submit Button */}
            <div style={{ textAlign: 'right' }}>
                <button
                    onClick={handleSubmit}
                    style={{ padding: '12px 24px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                    {quizId === 'new' ? '💾 Save New Quiz' : '💾 Update Quiz'}
                </button>
            </div>

        </div>
    )
}

export default QuizEditor