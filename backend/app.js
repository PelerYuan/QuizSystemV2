const config = require('./utils/config')
const express = require('express')
const mediaRouter = require('./controllers/media')

const app = express()
const { apiReference } = require('@scalar/express-api-reference')
const openapiSpec = require('./utils/openapiSpec')
const cors = require('cors')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

const quizzesRouter = require('./controllers/quizzes')
const authRouter = require('./controllers/auth')
const entranceRouter = require('./controllers/entrances')
const examRouter = require('./controllers/exam')

mongoose.set('strictQuery', false)

logger.info(`connecting to ${config.MONGODB_URI}`)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error(`error connecting to MongoDB: ${error.message}`)
    })

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/uploads', express.static('uploads'))

app.use(
    '/reference',
    apiReference({
        theme: 'moon',
        spec: {
            content: openapiSpec,
        },
    })
)
logger.info(`Live API document at http://localhost:${config.PORT}/reference`)

app.use('/api/quizzes', quizzesRouter)
app.use('/api/auth', authRouter)
app.use('/api/entrances', entranceRouter)
app.use('/api/exam', examRouter)
app.use('/api/media', mediaRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app