const examRouter = require('express').Router()
const Entrance = require('../models/entrance')
const Quiz = require('../models/quiz')
const Submission = require('../models/submission')

examRouter.get('/entrance/:accessCode', async (request, response) => {
    const accessCode = request.params.accessCode.toUpperCase()
    const entrance = await Entrance.findOne({ accessCode: accessCode }).populate('quizId')

    if (!entrance) {
        return response.status(404).json({ error: 'Invalid access code' })
    }
    if (!entrance.isActive) {
        return response.status(403).json({ error: 'This exam session is currently closed' })
    }
    if (!entrance.quizId) {
        return response.status(404).json({ error: 'Associated quiz template not found' })
    }

    const safeQuiz = JSON.parse(JSON.stringify(entrance.quizId))
    if (safeQuiz.questions && safeQuiz.questions.questions) {
        safeQuiz.questions.questions.forEach(question => {
            if (question.options) {
                question.options.forEach(opt => {
                    delete opt.correct
                })
            }
        })
    }

    response.json({
        entranceId: entrance._id,
        entranceName: entrance.name,
        quiz: safeQuiz
    })
})

examRouter.post('/submit', async (request, response) => {
    const { entranceId, studentName, answers } = request.body

    if (!entranceId || !studentName || !answers || !answers.questions) {
        return response.status(400).json({ error: 'entranceId, studentName, and properly formatted answers are required' })
    }

    const entrance = await Entrance.findById(entranceId).populate('quizId')
    if (!entrance) return response.status(404).json({ error: 'Entrance not found' })
    if (!entrance.isActive) return response.status(403).json({ error: 'Exam is closed, submissions are no longer accepted' })

    const quiz = entrance.quizId
    const defaultPoint = quiz.questions.points || 1

    let calculatedTotalScore = 0
    const gradedAnswers = {
        point: defaultPoint,
        totalScore: 0,
        questions: []
    }

    const studentAnswerArray = answers.questions
    const teacherQuestions = quiz.questions.questions

    teacherQuestions.forEach((tQuestion, index) => {
        const sAnswer = studentAnswerArray[index] || {}
        let earnedPoint = 0

        if (tQuestion.options) {
            const correctOptions = tQuestion.options
                .filter(opt => opt.correct)
                .map(opt => opt.opt)
            const studentSelections = sAnswer.selections || []
            const isCorrect = correctOptions.length === studentSelections.length &&
                correctOptions.every(val => studentSelections.includes(val))
            if (isCorrect) {
                earnedPoint = defaultPoint
            }
            gradedAnswers.questions.push({
                selections: studentSelections,
                point: earnedPoint
            })
        }

        else if (tQuestion.itext !== undefined) {
            gradedAnswers.questions.push({
                answer: sAnswer.answer || "",
                point: 0
            })
        }

        calculatedTotalScore += earnedPoint
    })

    gradedAnswers.totalScore = calculatedTotalScore
    const submission = new Submission({
        entranceId: entranceId,
        studentName: studentName,
        answers: gradedAnswers,
        totalScore: calculatedTotalScore
    })
    const savedSubmission = await submission.save()

    response.status(201).json({ submissionId: savedSubmission._id })
})

examRouter.get('/result/:submissionId', async (request, response) => {
    const submission = await Submission.findById(request.params.submissionId)
        .populate({
            path: 'entranceId',
            populate: { path: 'quizId' }
        })

    if (!submission) {
        return response.status(404).json({ error: 'Submission not found' })
    }

    response.json({
        submissionId: submission._id,
        studentName: submission.studentName,
        totalScore: submission.totalScore,
        submittedAt: submission.submittedAt,
        entranceName: submission.entranceId.name,
        quizTitle: submission.entranceId.quizId.name,
        quizQuestions: submission.entranceId.quizId.questions,
        studentAnswers: submission.answers
    })
})

module.exports = examRouter