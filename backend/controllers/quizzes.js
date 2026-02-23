const quizzesRouter = require('express').Router()
const Quiz = require('../models/quiz')
const Entrance = require('../models/entrance')
const Submission = require('../models/submission')
const middleware = require('../utils/middleware')
const {response, request} = require("express");

quizzesRouter.use(middleware.verifyAdmin)

quizzesRouter.get('/', async (request, response) => {
    const quizzes = await Quiz.find({})
    response.json(quizzes)
})

quizzesRouter.get('/:id', async (request, response) => {
    const quiz = await Quiz.findById(request.params.id)
    if (quiz) {
        response.json(quiz)
    } else {
        response.status(404).end()
    }
})

quizzesRouter.post('/', async (request, response) => {
    const body = request.body

    const quiz = new Quiz({
        name: body.name,
        description: body.description,
        questions: body.questions
    })

    const savedQuiz = await quiz.save()
    response.status(201).json(savedQuiz)
})

quizzesRouter.put('/:id', async (request, response) => {
    const body = request.body

    if (!body.name || !body.questions) {
        return response.status(400).json({error: 'name and questions are strictly required'})
    }

    const quiz = {
        name: body.name,
        description: body.description,
        questions: body.questions
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(request.params.id, quiz, {new: true, runValidators: true})
    if (updatedQuiz) {
        response.json(updatedQuiz)
    } else {
        response.status(404).end()
    }
})

quizzesRouter.delete('/:id', async (request, response) => {
    const quizId = request.params.id
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId)
    if (!deletedQuiz) {
        return response.status(404).json({error: 'quiz not found'})
    }

    const deletedId = deletedQuiz._id
    const entrances = await Entrance.find({quizId: deletedId})
    const entranceIds = entrances.map(en => en._id)

    if (entranceIds.length > 0) {
        await Submission.deleteMany({entranceId: {$in: entranceIds}})
    }

    await Entrance.deleteMany({quizId: deletedId})

    response.status(204).end()
})

module.exports = quizzesRouter