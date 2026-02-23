const { test, describe, after, beforeEach, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Quiz = require('../models/quiz')
const helper = require('./test_helper')
const config = require('../utils/config')

const api = supertest(app)

describe('GET /api/quizzes endpoint tests', () => {
    let validToken = ''

    // FSO Best Practice: Authenticate via the actual API before running protected tests
    before(async () => {
        const loginResponse = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })

        validToken = loginResponse.body.token
    })

    // Clear the database and insert clean mock data before each individual test
    beforeEach(async () => {
        await Quiz.deleteMany({})
        await Quiz.insertMany(helper.initialQuizzes)
    })

    test('fails with status 401 if a token is not provided', async () => {
        const response = await api
            .get('/api/quizzes')
            .expect(401)
            .expect('Content-Type', /application\/json/)

        // Your middleware should catch the missing token and return this error
        assert.strictEqual(response.body.error, 'token missing')
    })

    test('fails with status 401 if an invalid or fake token is provided', async () => {
        const invalidToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature'

        const response = await api
            .get('/api/quizzes')
            .set('Authorization', invalidToken)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        // Your error handler middleware catches JsonWebTokenError
        assert.strictEqual(response.body.error, 'token missing or invalid')
    })

    test('successfully returns all quizzes with status 200 when a valid token is provided', async () => {
        const response = await api
            .get('/api/quizzes')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        // Verify that the number of returned items matches the initial mock data length
        assert.strictEqual(response.body.length, helper.initialQuizzes.length)
    })

    test('returned quiz data contains the expected structured JSON format', async () => {
        const response = await api
            .get('/api/quizzes')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200)

        // Extract the internal JSON titles from the returned data for assertion
        const returnedTitles = response.body.map(q => q.questions.title)

        assert.ok(returnedTitles.includes('PYTHON QUIZ TRIAL'))
        assert.ok(returnedTitles.includes('React Hooks Quiz'))

        // Randomly sample the specific nested structure of a question
        const pythonQuiz = response.body.find(q => q.name === 'Midterm Python Fundamentals')
        assert.strictEqual(pythonQuiz.questions.points, 1)
        assert.strictEqual(pythonQuiz.questions.questions[0].Q, 'What is the value of new_number variable?')
    })
})

// Terminate the database connection to ensure the test process exits gracefully
after(async () => {
    await mongoose.connection.close()
})