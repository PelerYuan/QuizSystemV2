const quizzesRouter = require('express').Router()
const Quiz = require('../models/quiz')
const Entrance = require('../models/entrance')
const Submission = require('../models/submission')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const {response, request} = require("express");

const verifyAdmin = (request, response) => {
    if (!request.token) {
        response.status(401).json({error: 'token missing'})
        return false
    }
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.role || decodedToken.role !== 'admin') {
        response.status(401).json({error: 'token invalid'})
        return false
    }
    return true
}

quizzesRouter.get('/', async (request, response) => {
    if (!verifyAdmin(request, response))
        return

    const quizzes = await Quiz.find({})
    response.json(quizzes)
})

quizzesRouter.get('/:id', async (request, response) => {
    if (!verifyAdmin(request, response))
        return

    const quiz = await Quiz.findById(request.params.id)
    if (quiz) {
        response.json(quiz)
    } else {
        response.status(404).end()
    }
})

quizzesRouter.post('/', async (request, response) => {
    if (!verifyAdmin(request, response))
        return

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
    if (!verifyAdmin(request, response))
        return

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
    if (!verifyAdmin(request, response))
        return

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