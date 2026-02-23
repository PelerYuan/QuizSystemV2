const quizzesRouter = require('express').Router()
const Quiz = require('../models/quiz')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

quizzesRouter.get('/', async (request, response) => {
    const decodedToken = jwt.verify(request.token, config.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({error: 'token invalid'})
    }

    const quizzes = await Quiz.find({})
    response.json(quizzes)
})

module.exports = quizzesRouter