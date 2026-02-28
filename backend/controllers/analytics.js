const analyticsRouter = require('express').Router()
const Entrance = require('../models/entrance')
const Quiz = require('../models/quiz')
const Submission = require('../models/submission')
const middleware = require('../utils/middleware')

analyticsRouter.use(middleware.verifyAdmin)

analyticsRouter.get('/entrance/:entranceId', async (request, response) => {
    const {entranceId} = request.params

    const entrance = await Entrance.findById(entranceId)
    if (!entrance) {
        return response.status(404).json({error: 'Entrance not found'})
    }

    const quiz = await Quiz.findById(entrance.quizId)
    const pointsPerQuestion = Number(quiz?.questions?.points) || 0
    const questionsList = quiz?.questions?.questions || []
    const maxScore = questionsList.filter(q => Array.isArray(q.options)).length * pointsPerQuestion

    const submissions = await Submission.find({entranceId}).sort({submittedAt: -1})

    if (submissions.length === 0) {
        return response.json({
            entranceName: entrance.name,
            maxScore,
            totalStudents: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            scoreList: []
        })
    }

    const scores = submissions.map(s => s.totalScore)
    const totalStudents = scores.length
    const averageScore = Number((scores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(2))
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)

    const scoreList = submissions.map(sub => ({
        submissionId: sub._id,
        studentName: sub.studentName,
        totalScore: sub.totalScore,
        submittedAt: sub.submittedAt
    }))

    response.json({
        entranceName: entrance.name,
        maxScore,
        totalStudents,
        averageScore,
        highestScore,
        lowestScore,
        scoreList
    })
})

analyticsRouter.get('/export/:entranceId', async (request, response) => {
    const {entranceId} = request.params

    const entrance = await Entrance.findById(entranceId)
    if (!entrance) return response.status(404).json({error: 'Entrance not found'})

    const quiz = await Quiz.findById(entrance.quizId)
    const pointsPerQuestion = Number(quiz?.questions?.points) || 0
    const questionsList = quiz?.questions?.questions || []
    const maxScore = questionsList.filter(q => Array.isArray(q.options)).length * pointsPerQuestion

    const submissions = await Submission.find({entranceId}).sort({submittedAt: -1})

    let csvContent = '\uFEFF' + 'Student Name,Total Score,Max Score,Submission Time\n'

    submissions.forEach(sub => {
        const safeName = `"${sub.studentName.replace(/"/g, '""')}"`
        const score = sub.totalScore
        const submitTime = `"${new Date(sub.submittedAt).toLocaleString()}"`

        csvContent += `${safeName},${score},${maxScore},${submitTime}\n`
    })

    const safeFilename = entrance.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()

    response.setHeader('Content-Type', 'text/csv; charset=utf-8')
    response.setHeader('Content-Disposition', `attachment; filename="${safeFilename}_results.csv"`)
    response.status(200).send(csvContent)
})

module.exports = analyticsRouter