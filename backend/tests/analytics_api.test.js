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

describe('Analytics API (/api/analytics)', () => {
    let validToken = ''
    let activeEntranceId = ''
    let emptyEntranceId = ''

    // 1. Login to obtain Admin Token
    before(async () => {
        const loginResponse = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })
        validToken = loginResponse.body.token
    })

    // 2. Reset database and inject scenario-specific data before each test
    beforeEach(async () => {
        await Quiz.deleteMany({})
        await Entrance.deleteMany({})
        await Submission.deleteMany({})

        // Construct a quiz with a maximum score of 10 (2 objective questions * 5 points each)
        const mockQuiz = new Quiz({
            name: "Analytics Math Test",
            questions: {
                points: 5,
                questions: [
                    { Q: "1+1?", options: [{ opt: "A" }, { opt: "B" }] }, // Scored if options exist
                    { Q: "2+2?", options: [{ opt: "C" }, { opt: "D" }] },
                    { Q: "What do you think?", itext: "" } // Subjective questions are not included in maxScore
                ]
            }
        })
        const savedQuiz = await mockQuiz.save()

        // Construct two Entrances: one with submissions, one completely empty
        const entranceWithSubs = new Entrance({
            quizId: savedQuiz._id,
            accessCode: "TEST",
            name: "Populated Session",
            isActive: true
        })
        const emptyEntrance = new Entrance({
            quizId: savedQuiz._id,
            accessCode: "NULL",
            name: "Empty Session",
            isActive: true
        })

        const savedEntrances = await Entrance.insertMany([entranceWithSubs, emptyEntrance])
        activeEntranceId = savedEntrances[0]._id.toString()
        emptyEntranceId = savedEntrances[1]._id.toString()

        // Insert 3 graded submission records for the first Entrance to test statistical logic
        // Scores: 10, 5, 0 (Average should be 5)
        const initialSubmissions = [
            {
                entranceId: activeEntranceId,
                studentName: "Alice Genius",
                totalScore: 10, // Highest score
                answers: { dummy: true },
                submittedAt: new Date('2026-02-28T10:00:00Z')
            },
            {
                entranceId: activeEntranceId,
                studentName: "Bob Average",
                totalScore: 5,
                answers: { dummy: true },
                submittedAt: new Date('2026-02-28T10:05:00Z')
            },
            {
                entranceId: activeEntranceId,
                // Edge case name to test CSV export resilience against special characters
                studentName: "Charlie, The \"Hacker\"",
                totalScore: 0, // Lowest score
                answers: { dummy: true },
                submittedAt: new Date('2026-02-28T10:10:00Z')
            }
        ]
        await Submission.insertMany(initialSubmissions)
    })

    describe('1. GET /api/analytics/entrance/:entranceId (Dashboard Data)', () => {
        test('succeeds and accurately calculates statistical metrics', async () => {
            const response = await api
                .get(`/api/analytics/entrance/${activeEntranceId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const data = response.body

            // Verify core calculation logic accuracy
            assert.strictEqual(data.entranceName, "Populated Session")
            assert.strictEqual(data.maxScore, 10) // 2 questions * 5 points
            assert.strictEqual(data.totalStudents, 3)
            assert.strictEqual(data.highestScore, 10)
            assert.strictEqual(data.lowestScore, 0)
            assert.strictEqual(data.averageScore, 5) // (10+5+0)/3 = 5

            // Verify if scoreList format is correctly flattened
            assert.strictEqual(data.scoreList.length, 3)
            assert.ok(data.scoreList[0].submissionId)
            assert.ok(data.scoreList[0].studentName)
            // Ensure large raw 'answers' objects are not leaked to the frontend
            assert.strictEqual(data.scoreList[0].answers, undefined)
        })

        test('EDGE CASE: succeeds but returns safe zero-values if entrance has NO submissions', async () => {
            const response = await api
                .get(`/api/analytics/entrance/${emptyEntranceId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            const data = response.body

            // Must return safely without NaN or Infinity errors
            assert.strictEqual(data.totalStudents, 0)
            assert.strictEqual(data.averageScore, 0)
            assert.strictEqual(data.highestScore, 0)
            assert.strictEqual(data.lowestScore, 0)
            assert.deepStrictEqual(data.scoreList, [])
        })

        test('EDGE CASE: handles "Orphan Entrance" where associated Quiz was deleted', async () => {
            // Force delete the associated Quiz
            await Quiz.deleteMany({})

            const response = await api
                .get(`/api/analytics/entrance/${activeEntranceId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            // Should still return student scores even if the quiz template is missing;
            // maxScore degrades to 0, preventing server crash
            assert.strictEqual(response.body.maxScore, 0)
            assert.strictEqual(response.body.totalStudents, 3)
        })

        test('fails with status 404 for non-existing entrance id', async () => {
            const nonExistingId = await helper.nonExistingEntranceId()
            await api
                .get(`/api/analytics/entrance/${nonExistingId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404)
        })

        test('fails with status 401 if token is missing', async () => {
            await api
                .get(`/api/analytics/entrance/${activeEntranceId}`)
                .expect(401)
        })
    })

    describe('2. GET /api/analytics/export/:entranceId (CSV Export)', () => {
        test('succeeds and returns correctly formatted CSV plain text', async () => {
            const response = await api
                .get(`/api/analytics/export/${activeEntranceId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200)

            // Test Headers: Must be text/csv and trigger attachment download
            assert.match(response.headers['content-type'], /text\/csv/)
            assert.match(response.headers['content-disposition'], /attachment; filename="populated_session_results\.csv"/)

            // Test CSV content
            const csvText = response.text
            // Includes BOM header to prevent encoding issues with non-ASCII characters
            assert.ok(csvText.startsWith('\uFEFF'))
            // Includes table header
            assert.ok(csvText.includes('Student Name,Total Score,Max Score,Submission Time'))
            // Includes valid student scores
            assert.ok(csvText.includes('Alice Genius",10,10,'))
        })

        test('EDGE CASE: prevents CSV Injection by escaping quotes and commas in student names', async () => {
            const response = await api
                .get(`/api/analytics/export/${activeEntranceId}`)
                .set('Authorization', `Bearer ${validToken}`)

            const csvText = response.text
            // Original name: Charlie, The "Hacker"
            // In standard CSV, double quotes should be replaced by two double quotes ("")
            // and the entire field should be wrapped in double quotes.
            const escapedName = `"Charlie, The ""Hacker"""`

            assert.ok(
                csvText.includes(escapedName),
                "CSV formatting failed to escape special characters, making it vulnerable to CSV injection."
            )
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})