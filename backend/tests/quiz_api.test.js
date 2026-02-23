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

describe('Quiz Management API (/api/quizzes)', () => {
    let validToken = ''

    // FSO Best Practice: Authenticate once before running the tests
    before(async () => {
        const loginResponse = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })
        validToken = loginResponse.body.token
    })

    // Reset database to initial state before each test to ensure isolation
    beforeEach(async () => {
        await Quiz.deleteMany({})
        await Quiz.insertMany(helper.initialQuizzes)
    })

    describe('1. Fetching all quizzes (GET /)', () => {
        test('succeeds with status 200 and returns expected structure', async () => {
            const response = await api
                .get('/api/quizzes')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.length, helper.initialQuizzes.length)

            const returnedTitles = response.body.map(q => q.questions.title)
            assert.ok(returnedTitles.includes('PYTHON QUIZ TRIAL'))
        })

        test('fails with status 401 if token is missing', async () => {
            const response = await api.get('/api/quizzes').expect(401)
            assert.strictEqual(response.body.error, 'token missing')
        })

        test('fails with status 401 if token is invalid or tampered', async () => {
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature'
            const response = await api
                .get('/api/quizzes')
                .set('Authorization', `Bearer ${fakeToken}`)
                .expect(401)

            assert.strictEqual(response.body.error, 'token missing or invalid')
        })
    })

    describe('2. Fetching a specific quiz (GET /:id)', () => {
        test('succeeds with a valid id', async () => {
            const quizzesAtStart = await helper.quizzesInDb()
            const quizToView = quizzesAtStart[0]

            const resultQuiz = await api
                .get(`/api/quizzes/${quizToView.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            // Parse and stringify to convert MongoDB Date objects into JSON strings
            // This prevents deepStrictEqual from failing due to type mismatch
            assert.deepStrictEqual(resultQuiz.body, JSON.parse(JSON.stringify(quizToView)))
        })

        test('fails with status 404 if quiz does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .get(`/api/quizzes/${validNonexistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404)
        })

        test('fails with status 400 if id is malformatted', async () => {
            const invalidId = '5a3d5da59070081a82a3445' // Missing one character

            await api
                .get(`/api/quizzes/${invalidId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)
        })
    })

    describe('3. Creating a new quiz (POST /)', () => {
        test('succeeds with valid data', async () => {
            const newQuiz = {
                name: "Automated Integration Test Quiz",
                description: "Created via POST request during testing",
                questions: {
                    title: "Integration Test Data",
                    points: 5,
                    questions: [{ Q: "Is this a test?", options: [{ opt: "Yes", correct: true }] }]
                }
            }

            await api
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${validToken}`)
                .send(newQuiz)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            // Verify the total count increased by 1
            const quizzesAtEnd = await helper.quizzesInDb()
            assert.strictEqual(quizzesAtEnd.length, helper.initialQuizzes.length + 1)

            // Verify the newly added quiz content exists in the database
            const names = quizzesAtEnd.map(q => q.name)
            assert.ok(names.includes('Automated Integration Test Quiz'))
        })

        test('fails with status 400 if required properties are missing', async () => {
            const newQuiz = {
                description: "This is missing the mandatory name and questions fields"
            }

            await api
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${validToken}`)
                .send(newQuiz)
                .expect(400)

            // Verify the database size remained exactly the same
            const quizzesAtEnd = await helper.quizzesInDb()
            assert.strictEqual(quizzesAtEnd.length, helper.initialQuizzes.length)
        })

        test('fails with status 400 if required properties are present but empty (empty strings)', async () => {
            const emptyQuiz = {
                name: "   ", // 仅包含空格的空白字符串
                description: "Test",
                questions: {}
            }

            await api
                .post('/api/quizzes')
                .set('Authorization', `Bearer ${validToken}`)
                .send(emptyQuiz)
                .expect(400)
        })
    })

    describe('4. Updating a quiz (PUT /:id)', () => {
        test('succeeds in updating the name of an existing quiz', async () => {
            const quizzesAtStart = await helper.quizzesInDb()
            const quizToUpdate = quizzesAtStart[0]

            const updatedData = { ...quizToUpdate, name: "Updated Name via PUT" }

            await api
                .put(`/api/quizzes/${quizToUpdate.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(updatedData)
                .expect(200)

            const quizzesAtEnd = await helper.quizzesInDb()
            const updatedQuizInDb = quizzesAtEnd.find(q => q.id === quizToUpdate.id)
            assert.strictEqual(updatedQuizInDb.name, "Updated Name via PUT")
        })

        test('fails with status 400 if updated data is missing required fields', async () => {
            const quizzesAtStart = await helper.quizzesInDb()
            const quizToUpdate = quizzesAtStart[0]

            // Intentionally omitting the required 'name' and 'questions' fields
            const invalidUpdateData = { description: "Missing required fields" }

            await api
                .put(`/api/quizzes/${quizToUpdate.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send(invalidUpdateData)
                .expect(400)
        })

        test('fails with status 400 if id is malformatted', async () => {
            await api
                .put('/api/quizzes/invalidMongoId123')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ name: "Test", questions: {} })
                .expect(400)
        })

        test('fails with status 404 if updating non-existing quiz', async () => {
            const validNonexistingId = await helper.nonExistingId()
            await api
                .put(`/api/quizzes/${validNonexistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ name: "Test", questions: {} })
                .expect(404)
        })
    })

    describe('5. Deleting a quiz (DELETE /:id)', () => {
        test('succeeds with status 204 if id is valid', async () => {
            const quizzesAtStart = await helper.quizzesInDb()
            const quizToDelete = quizzesAtStart[0]

            await api.delete(`/api/quizzes/${quizToDelete.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204)

            const quizzesAtEnd = await helper.quizzesInDb()
            assert.strictEqual(quizzesAtEnd.length, helper.initialQuizzes.length - 1)
        })

        test('fails with status 400 if id is malformatted', async () => {
            await api.delete('/api/quizzes/invalidMongoId123')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(400)
        })

        test('fails with status 404 if deleting a non-existing but valid id', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api.delete(`/api/quizzes/${validNonexistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404)
        })

        test('CASCADE DELETION: deeply deletes associated Entrances and Submissions', async () => {
            const quizzesAtStart = await helper.quizzesInDb()
            const quizToDelete = quizzesAtStart[0]

            // 1. Manually create a related Entrance in the database for this Quiz
            const mockEntrance = new Entrance({
                quizId: quizToDelete.id,
                accessCode: "TEST",
                name: "Mock Session",
                isActive: true
            })
            const savedEntrance = await mockEntrance.save()

            // 2. Create a Submission based on this specific Entrance
            const mockSubmission = new Submission({
                entranceId: savedEntrance._id,
                studentName: "Test Student",
                answers: { "q1": "a" },
                totalScore: 10
            })
            await mockSubmission.save()

            // 3. Execute the delete operation on the parent Quiz
            await api.delete(`/api/quizzes/${quizToDelete.id}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(204)

            // 4. Assertion: The parent Quiz must be deleted
            const quizzesAfter = await Quiz.findById(quizToDelete.id)
            assert.strictEqual(quizzesAfter, null)

            // 5. Assertion: The related Entrance MUST be cascade-deleted
            const entrancesAfter = await Entrance.findById(savedEntrance._id)
            assert.strictEqual(entrancesAfter, null)

            // 6. Assertion: The related Submission MUST be cascade-deleted
            const submissionsAfter = await Submission.findById(mockSubmission._id)
            assert.strictEqual(submissionsAfter, null)
        })
    })
})

// Terminate the database connection to ensure the test process exits gracefully
after(async () => {
    await mongoose.connection.close()
})