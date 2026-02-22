const config = require('./utils/config')
const express = require('express')

const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

const quizzesRouter = require('./controllers/quizzes')

mongoose.set('strictQuery', false)

logger.info(`connecting to ${config.MONGODB_URL}`)

mongoose.connect(config.MONGODB_URL)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error(`error connecting to MongoDB: ${error.message}`)
    })

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/quizzes', quizzesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app