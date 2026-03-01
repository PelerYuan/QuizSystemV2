import {use, useState} from "react";

export const useAdminEditForm = (initialData = null) => {
    const [quiz, setQuiz] = useState(initialData || {
        title: '',
        subtitle: '',
        description: '',
        points: 1,
        questions: []
    })

    const handleMetaChange = (e) => {
        const {name, value} = e.target
        setQuiz({...quiz, [name]: value})
    }

    const addQuestion = () => {
        const newQuestion = {
            Q: '',
            uiType: 'SINGLE',
            options: [{opt: '', correct: false}, {opt: '', correct: false}],
            itext: ''
        }
        setQuiz({...quiz, questions: [...quiz.questions, newQuestion]})
    }

    const removeQuestion = (qIndex) => {
        const updatedQuestions = quiz.questions.filter((_, index) => index !== qIndex)
        setQuiz({...quiz, questions: updatedQuestions})
    }

    const handleQuestionChange = (qIndex, field, value) => {
        const updatedQuestions = [...quiz.questions]
        updatedQuestions[qIndex] = {...updatedQuestions[qIndex], [field]: value}
        setQuiz({...quiz, questions: updatedQuestions})
    }

    const addOption = (qIndex) => {
        const updatedQuestions = [...quiz.questions]
        updatedQuestions[qIndex].options.push({opt: '', correct: false})
        setQuiz({...quiz, questions: updatedQuestions})
    }

    const removeOption = (qIndex, optIndex) => {
        const updatedQuestions = [...quiz.questions]
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== optIndex)
        setQuiz({...quiz, questions: updatedQuestions})
    }

    const handleOptionTextChange = (qIndex, optIndex, value) => {
        const updatedQuestions = [...quiz.questions]
        updatedQuestions[qIndex].options[optIndex].opt = value
        setQuiz({...quiz, questions: updatedQuestions})
    }

    const toggleCorrectAnswer = (qIndex, optIndex) => {
        setQuiz(prevQuiz => {
            const updatedQuestions = [...prevQuiz.questions]
            const question = { ...updatedQuestions[qIndex] }
            const currentOptions = [...question.options]

            if (question.uiType === 'SINGLE') {
                currentOptions.forEach((o, i) => {
                    currentOptions[i] = { ...o, correct: i === optIndex }
                })
            } else if (question.uiType === 'MULTIPLE') {
                currentOptions[optIndex] = {
                    ...currentOptions[optIndex],
                    correct: !currentOptions[optIndex].correct
                }
            }

            question.options = currentOptions
            updatedQuestions[qIndex] = question

            return { ...prevQuiz, questions: updatedQuestions }
        })
    }

    const loadFetchedQuiz = (backendData) => {
        const parsedQuestions = backendData.questions.questions.map(q => {
            let uiType = 'SINGLE'

            if (q.itext !== undefined) {
                uiType = 'TEXT'
            } else if (q.options) {
                const correctCount = q.options.filter(opt => opt.correct).length
                if (correctCount > 1) {
                    uiType = 'MULTIPLE'
                }
            }

            return {
                Q: q.Q,
                uiType: uiType,
                options: q.options || [{ opt: '', correct: false }, { opt: '', correct: false }],
                itext: q.itext !== undefined ? q.itext : ''
            }
        })

        setQuiz({
            title: backendData.questions.title || backendData.name,
            subtitle: backendData.questions.subtitle || '',
            description: backendData.description || '',
            points: backendData.questions.points || 1,
            questions: parsedQuestions
        })
    }

    const actions = {
        addQuestion,
        removeQuestion,
        handleQuestionChange,
        addOption,
        removeOption,
        handleOptionTextChange,
        toggleCorrectAnswer,
        loadFetchedQuiz
    }

    return {
        quiz,
        handleMetaChange,
        actions
    }
}