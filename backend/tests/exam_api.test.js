const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Quiz = require('../models/quiz')
const Entrance = require('../models/entrance')
const Submission = require('../models/submission')
const helper = require('./test_helper')

const api = supertest(app)

describe('Student Exam Execution API (/api/exam)', () => {
    let activeEntranceId = ''
    let closedEntranceId = ''
    let defaultPoint = 10 // Set default point to 10 for easier calculation

    // Note: The student-facing API is completely public.
    // Therefore, we do not need to fetch an Admin Token in the before() hook.

    // Before each test, build an "Ultimate Quiz" containing single-choice,
    // multiple-choice, and subjective questions, and bind it to various entrance states.
    beforeEach(async () => {
        await Quiz.deleteMany({})
        await Entrance.deleteMany({})
        await Submission.deleteMany({})

        // 1. Create a quiz covering all question types
        const testQuiz = new Quiz({
            name: "Ultimate Auto-Grading Test",
            questions: {
                points: defaultPoint,
                questions: [
                    { Q: "Q1: Single Choice", options: [{ opt: "A", correct: true }, { opt: "B" }] },
                    { Q: "Q2: Multi Choice", options: [{ opt: "A", correct: true }, { opt: "B", correct: true }, { opt: "C" }] },
                    { Q: "Q3: Fill Blank", itext: "" }
                ]
            }
        })
        const savedQuiz = await testQuiz.save()

        // 2. Create three exam entrances with different statuses
        const activeEntrance = new Entrance({
            quizId: savedQuiz._id,
            accessCode: "ACTV",
            name: "Active Session",
            isActive: true
        })
        const closedEntrance = new Entrance({
            quizId: savedQuiz._id,
            accessCode: "CLSD",
            name: "Closed Session",
            isActive: false
        })
        const fakeQuizId = await helper.nonExistingId()
        const orphanEntrance = new Entrance({
            quizId: fakeQuizId,
            accessCode: "ORPH", // Intentionally omit quizId to simulate an orphaned entrance
            name: "Orphan Session",
            isActive: true
        })

        const savedActive = await activeEntrance.save()
        const savedClosed = await closedEntrance.save()
        await orphanEntrance.save()

        activeEntranceId = savedActive._id.toString()
        closedEntranceId = savedClosed._id.toString()
    })

    describe('1. Fetching an exam by Access Code (GET /entrance/:accessCode)', () => {
        test('succeeds and ANTI-CHEATING WORKS: "correct" tags are completely stripped', async () => {
            const response = await api
                .get('/api/exam/entrance/ACTV') // Normal uppercase
                .expect(200)
                .expect('Content-Type', /application\/json/)

            // Business logic assertion: successfully retrieved basic exam info
            assert.strictEqual(response.body.entranceName, "Active Session")
            assert.ok(response.body.quiz)

            // Security assertion (Anti-cheating): Verify the quiz sent to the frontend
            // absolutely does NOT contain the 'correct: true' indicator.
            const filteredQuestions = response.body.quiz.questions.questions

            // Check all options of the first question; they should not expose the answer
            filteredQuestions[0].options.forEach(option => {
                assert.strictEqual(option.correct, undefined)
            })
        })

        test('EDGE CASE: succeeds even if the student types access code in lowercase', async () => {
            await api
                .get('/api/exam/entrance/actv') // Intentionally lowercase
                .expect(200)
        })

        test('fails with status 403 if trying to access a closed exam', async () => {
            const response = await api
                .get('/api/exam/entrance/CLSD')
                .expect(403)

            assert.strictEqual(response.body.error, 'This exam session is currently closed')
        })

        test('fails with status 404 if the access code does not exist', async () => {
            await api.get('/api/exam/entrance/FAKE').expect(404)
        })

        test('fails with status 404 if the entrance exists but the tied quiz was deleted', async () => {
            const response = await api.get('/api/exam/entrance/ORPH').expect(404)
            assert.strictEqual(response.body.error, 'Associated quiz template not found')
        })
    })

    describe('2. Submitting exam and auto-grading (POST /submit)', () => {
        test('succeeds and perfectly calculates score (Partial correct, Exact match, and Subjective)', async () => {
            const studentPayload = {
                entranceId: activeEntranceId,
                studentName: "John Doe",
                answers: {
                    questions: [
                        { selections: ["A"] },           // Q1: Single choice correct -> 10 points
                        { selections: ["A"] },           // Q2: Multi-choice partially correct -> 0 points (Must select A & B)
                        { answer: "I don't know" }       // Q3: Subjective question default -> 0 points
                    ]
                }
            }

            const response = await api
                .post('/api/exam/submit')
                .send(studentPayload)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            // Assertion: Successfully returned the submission ID
            assert.ok(response.body.submissionId)

            // Deep assertion: Check the database to ensure the backend calculated the score accurately
            const savedSubmission = await Submission.findById(response.body.submissionId)
            assert.strictEqual(savedSubmission.totalScore, 10) // 10 + 0 + 0 = 10
            assert.strictEqual(savedSubmission.answers.questions[1].point, 0) // Partial selection yields 0
            assert.strictEqual(savedSubmission.answers.questions[2].point, 0) // Subjective yields 0
        })

        test('succeeds and calculates perfect score for multi-select exact match', async () => {
            const studentPayload = {
                entranceId: activeEntranceId,
                studentName: "Jane Pro",
                answers: {
                    questions: [
                        { selections: ["A"] },           // Q1: Correct
                        { selections: ["B", "A"] }       // Q2: Correct options selected but in different order
                        // Intentionally omit the third question to simulate a blank answer
                    ]
                }
            }

            const response = await api.post('/api/exam/submit').send(studentPayload).expect(201)

            const savedSubmission = await Submission.findById(response.body.submissionId)
            assert.strictEqual(savedSubmission.totalScore, 20) // 10 + 10 = 20 points
        })

        test('fails with status 403 if submitting to a closed exam', async () => {
            const studentPayload = {
                entranceId: closedEntranceId,
                studentName: "Late Student",
                answers: { questions: [] }
            }

            const response = await api.post('/api/exam/submit').send(studentPayload).expect(403)
            assert.strictEqual(response.body.error, 'Exam is closed, submissions are no longer accepted')
        })

        test('fails with status 400 if required payload fields are missing', async () => {
            const invalidPayload = {
                entranceId: activeEntranceId
                // Missing studentName and answers
            }

            await api.post('/api/exam/submit').send(invalidPayload).expect(400)
        })
    })

    describe('3. Fetching detailed result (GET /result/:submissionId)', () => {
        let validSubmissionId = ''

        beforeEach(async () => {
            // Create a mock submission record before testing this module
            const mockSubmission = new Submission({
                entranceId: activeEntranceId,
                studentName: "Test Student",
                totalScore: 10,
                answers: { questions: [] }
            })
            const saved = await mockSubmission.save()
            validSubmissionId = saved._id.toString()
        })

        test('succeeds and populates deeply nested references (Entrance -> Quiz)', async () => {
            const response = await api
                .get(`/api/exam/result/${validSubmissionId}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            // Business logic assertion: Verify deeply nested data across three collections is populated
            assert.strictEqual(response.body.studentName, "Test Student")
            assert.strictEqual(response.body.entranceName, "Active Session")
            assert.strictEqual(response.body.quizTitle, "Ultimate Auto-Grading Test")

            // Note: The result retrieval endpoint MUST return the quiz parsing including correct answers
            assert.ok(response.body.quizQuestions)
        })

        test('fails with status 404 if submission id does not exist', async () => {
            const validButNonexistingId = await helper.nonExistingId()

            await api.get(`/api/exam/result/${validButNonexistingId}`).expect(404)
        })

        test('fails with status 400 if submission id is malformatted', async () => {
            await api.get('/api/exam/result/invalidId123').expect(400)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})