const { test, describe, after, beforeEach, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Quiz = require('../models/quiz')
const Entrance = require('../models/entrance')
const Submission = require('../models/submission')
const helper = require('./test_helper')
const config = require('../utils/config')

const api = supertest(app)

describe('Entrance Management API (/api/entrances)', () => {
    let validToken = ''
    let defaultQuizId = '' // We need a valid Quiz ID to attach our Entrances to

    // 1. Authenticate and get token
    before(async () => {
        const loginResponse = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })
        validToken = loginResponse.body.token
    })

    // 2. Reset DB and dynamically create initial relational data
    beforeEach(async () => {
        await Quiz.deleteMany({})
        await Entrance.deleteMany({})
        await Submission.deleteMany({})

        // Insert quizzes first to establish the parent relationship
        const savedQuizzes = await Quiz.insertMany(helper.initialQuizzes)
        defaultQuizId = savedQuizzes[0]._id.toString()

        // Insert initial mock entrances dynamically linked to the newly created quiz
        const initialEntrances = [
            { quizId: defaultQuizId, accessCode: "ABCD", name: "Morning Session", isActive: true },
            { quizId: defaultQuizId, accessCode: "WXYZ", name: "Evening Session", isActive: false }
        ]
        await Entrance.insertMany(initialEntrances)
    })

    describe('1. Fetching all entrances (GET /)', () => {
        test('succeeds with status 200 and correctly populates quiz details', async () => {
            const response = await api
                .get('/api/entrances')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.length, 2)

            // Deep Structural Assertion: Verify Mongoose .populate() worked properly
            // The quizId field should now be an object containing the 'name', not just a raw string ID
            const firstEntrance = response.body[0]
            assert.strictEqual(typeof firstEntrance.quizId, 'object')
            assert.ok(firstEntrance.quizId.name) // Checks if the populated name exists
        })

        test('fails with status 401 if token is missing', async () => {
            const response = await api.get('/api/entrances').expect(401)
            assert.strictEqual(response.body.error, 'token missing')
        })
    })

    describe('2. Creating a new entrance (POST /)', () => {
        test('succeeds with valid data and auto-generates a 4-character accessCode', async () => {
            const newEntrance = {
                quizId: defaultQuizId,
                name: "Automated Test Session",
                description: "This is a test entrance",
                isActive: true
            }

            const response = await api
                .post('/api/entrances')
                .set('Authorization', `Bearer ${validToken}`)
                .send(newEntrance)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            // Assert the DB count increased
            const entrancesAtEnd = await helper.entrancesInDb()
            assert.strictEqual(entrancesAtEnd.length, 3)

            // Assert business logic: The accessCode must be auto-generated and exactly 4 characters
            assert.ok(response.body.accessCode)
            assert.strictEqual(response.body.accessCode.length, 4)
            assert.match(response.body.accessCode, /^[A-Z0-9]{4}$/) // Regex to ensure it's alphanumeric uppercase

            // Assert population on return
            assert.strictEqual(typeof response.body.quizId, 'object')
        })

        test('fails with status 400 if required properties are missing', async () => {
            const invalidEntrance = {
                quizId: defaultQuizId
                // Missing 'name' and 'isActive'
            }

            await api
                .post('/api/entrances')
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidEntrance)
                .expect(400)
        })

        test('EDGE CASE: fails with status 404 if referencing a quizId that does not exist', async () => {
            const validButNonexistentQuizId = await helper.nonExistingId()

            const orphanEntrance = {
                quizId: validButNonexistentQuizId,
                name: "Orphan Session",
                isActive: true
            }

            const response = await api
                .post('/api/entrances')
                .set('Authorization', `Bearer ${validToken}`)
                .send(orphanEntrance)
                .expect(404)

            assert.strictEqual(response.body.error, 'referenced quiz not found')
        })
    })

    describe('3. Updating an entrance (PUT /:id)', () => {
        test('succeeds in partially updating the isActive status (Toggle Feature)', async () => {
            const entrancesAtStart = await helper.entrancesInDb()
            const entranceToUpdate = entrancesAtStart[0] // Is currently true

            // Send partial update
            const updatePayload = { isActive: false }

            const response = await api
                .put(`/api/entrances/${entranceToUpdate.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(updatePayload)
                .expect(200)

            // Assert the API response reflects the toggle
            assert.strictEqual(response.body.isActive, false)
            assert.strictEqual(response.body.name, entranceToUpdate.name) // Ensure other fields remained intact

            // Assert the DB reflects the toggle
            const entrancesAtEnd = await helper.entrancesInDb()
            const updatedEntranceInDb = entrancesAtEnd.find(e => e.id === entranceToUpdate.id)
            assert.strictEqual(updatedEntranceInDb.isActive, false)
        })

        test('fails with status 404 if updating non-existing entrance', async () => {
            const nonExistingId = await helper.nonExistingEntranceId()

            await api
                .put(`/api/entrances/${nonExistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ isActive: true })
                .expect(404)
        })
    })

    describe('4. Deleting an entrance (DELETE /:id)', () => {
        test('succeeds with status 204 if id is valid', async () => {
            const entrancesAtStart = await helper.entrancesInDb()
            const entranceToDelete = entrancesAtStart[0]

            await api.delete(`/api/entrances/${entranceToDelete.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204)

            const entrancesAtEnd = await helper.entrancesInDb()
            assert.strictEqual(entrancesAtEnd.length, entrancesAtStart.length - 1)
        })

        test('fails with status 404 if deleting a non-existing entrance', async () => {
            const nonExistingId = await helper.nonExistingEntranceId()

            await api.delete(`/api/entrances/${nonExistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404)
        })

        test('CASCADE DELETION: deeply deletes all associated Submissions', async () => {
            const entrancesAtStart = await helper.entrancesInDb()
            const entranceToDelete = entrancesAtStart[0]

            // 1. Manually create a Submission linked to this Entrance
            const mockSubmission = new Submission({
                entranceId: entranceToDelete.id,
                studentName: "Bob The Tester",
                answers: { "q1": "test" },
                totalScore: 100
            })
            await mockSubmission.save()

            // 2. Delete the Entrance
            await api.delete(`/api/entrances/${entranceToDelete.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204)

            // 3. Assertion: Entrance is gone
            const entranceCheck = await Entrance.findById(entranceToDelete.id)
            assert.strictEqual(entranceCheck, null)

            // 4. Assertion (The Core Edge Case): The associated Submission MUST be deleted
            const submissionCheck = await Submission.findById(mockSubmission._id)
            assert.strictEqual(submissionCheck, null)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})