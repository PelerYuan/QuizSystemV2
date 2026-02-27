const entrancesRouter = require('express').Router()
const Entrance = require('../models/entrance')
const Quiz = require('../models/quiz')
const Submission = require('../models/submission')
const middleware = require('../utils/middleware')

entrancesRouter.use(middleware.verifyAdmin)

const generateUniqueAccessCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let isUnique = false
    let accessCode = ''

    while (!isUnique) {
        accessCode = ''
        for (let i = 0; i < 4; i++) {
            accessCode += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        const existingEntrance = await Entrance.findOne({ accessCode })
        if (!existingEntrance) {
            isUnique = true
        }
    }
    return accessCode
}

entrancesRouter.get('/', async (request, response) => {
    const entrances = await Entrance.find({}).populate('quizId', { name: 1 })
    response.json(entrances)
})

entrancesRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body.quizId || !body.name || body.isActive === undefined) {
        return response.status(400).json({ error: 'quizId, name, and isActive are strictly required' })
    }

    const quizExists = await Quiz.findById(body.quizId)
    if (!quizExists) {
        return response.status(404).json({ error: 'referenced quiz not found' })
    }

    const accessCode = await generateUniqueAccessCode()

    const entrance = new Entrance({
        quizId: body.quizId,
        accessCode: accessCode,
        name: body.name,
        description: body.description,
        isActive: body.isActive
    })

    const savedEntrance = await entrance.save()
    await savedEntrance.populate('quizId', { name: 1 })

    response.status(201).json(savedEntrance)
})

entrancesRouter.put('/:id', async (request, response) => {
    const body = request.body

    const updateData = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updatedEntrance = await Entrance.findByIdAndUpdate(
        request.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('quizId', { name: 1 })

    if (updatedEntrance) {
        response.json(updatedEntrance)
    } else {
        response.status(404).json({ error: 'entrance not found' })
    }
})

entrancesRouter.delete('/:id', async (request, response) => {
    const entranceId = request.params.id

    const deletedEntrance = await Entrance.findByIdAndDelete(entranceId)
    if (!deletedEntrance) {
        return response.status(404).json({ error: 'entrance not found' })
    }

    const strictObjectId = deletedEntrance._id

    await Submission.deleteMany({ entranceId: strictObjectId })

    response.status(204).end()
})

module.exports = entrancesRouter