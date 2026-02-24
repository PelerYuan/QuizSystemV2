import {useAdminEditForm} from "../hooks/useAdminEditForm.js";
import QuestionCard from "../components/admin/edit/questionCard.jsx";

const AdminEdit = () => {
    const {quiz, handleMetaChange, actions} = useAdminEditForm()

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Clean and format the payload strictly based on schema.md & quiz_format.md
        const payload = {
            name: quiz.title,
            description: quiz.description,
            questions: {
                title: quiz.title,
                subtitle: quiz.subtitle,
                points: Number(quiz.points),
                questions: quiz.questions.map(q => {
                    const formattedQ = {Q: q.Q}
                    if (q.uiType === 'TEXT') {
                        formattedQ.itext = ''
                    } else {
                        formattedQ.options = q.options
                    }
                    return formattedQ
                })
            }
        }

        console.log("Payload ready for POST /api/quizzes:", payload)
        // TODO: await axios.post('/api/quizzes', payload, config)
    }

    return (
        <div style={{maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif'}}>

            {/* 1. Quiz Metadata Section */}
            <div style={{
                borderTop: '4px solid #007bff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '20px',
                marginBottom: '30px',
                backgroundColor: 'white',
                borderRadius: '0 0 8px 8px'
            }}>
                <h2 style={{marginTop: 0, color: '#333'}}>Quiz Information</h2>

                <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                    <div style={{flex: 1}}>
                        <label><b>Title *</b></label>
                        <input name="title" value={quiz.title} onChange={handleMetaChange} style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}/>
                    </div>
                    <div style={{flex: 1}}>
                        <label><b>Subtitle *</b></label>
                        <input name="subtitle" value={quiz.subtitle} onChange={handleMetaChange} style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}/>
                    </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                    <div style={{flex: 2}}>
                        <label><b>Description *</b></label>
                        <textarea name="description" value={quiz.description} onChange={handleMetaChange} style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            height: '80px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}/>
                    </div>
                    <div style={{flex: 1}}>
                        <label><b>Points per Question *</b></label>
                        <input type="number" name="points" value={quiz.points} onChange={handleMetaChange} style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}/>
                    </div>
                </div>
            </div>

            {/* 2. Questions Rendering Section */}
            {quiz.questions.map((q, index) => (
                <QuestionCard
                    key={index}
                    question={q}
                    qIndex={index}
                    actions={actions} // Drills down the entire action bundle cleanly
                />
            ))}

            {/* 3. Add Question Button */}
            <button
                onClick={actions.addQuestion}
                style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #007bff',
                    color: '#007bff',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                ＋ Add Question
            </button>

            {/* 4. Submit Button */}
            <div style={{textAlign: 'right'}}>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    💾 Save Quiz to Database
                </button>
            </div>

        </div>
    )
}

export default AdminEdit
