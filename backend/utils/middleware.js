const logger = require('./logger')
const Quiz = require("../models/quiz");
const jwt = require('jsonwebtoken')
const config = require('./config')

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    } else {
        request.token = null
    }
    next()
}

const verifyAdmin = (request, response, next) => {
    if (!request.token) {
        response.status(401).json({error: 'token missing'})
        return false
    }
    const decodedToken = jwt.verify(request.token, config.SECRET)
    if (!decodedToken.role || decodedToken.role !== 'admin') {
        response.status(401).json({error: 'token invalid'})
        return false
    }
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({error: 'token missing or invalid'})
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({error: 'token expired'})
    } else if (error.name === 'SyntaxError') {
        return response.status(400).json({error: 'malformed syntax or bad request'})
    }

    next(error)
}

module.exports = {
    tokenExtractor,
    verifyAdmin,
    unknownEndpoint,
    errorHandler
}