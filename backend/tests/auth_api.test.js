const { test, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const config = require('../utils/config')

const api = supertest(app)

describe('Authentication API (/api/auth)', () => {
    // Variable to store the token generated in the first test for subsequent tests
    let validToken = null

    test('1. POST /login succeeds with correct password and returns a token', async () => {
        const response = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        // Assert that a token was generated and returned
        assert.ok(response.body.token)
        assert.strictEqual(response.body.role, 'admin')

        // Save the token for use in the authenticated route tests below
        validToken = response.body.token
    })

    test('2. POST /login fails with status 401 when using the wrong password', async () => {
        const response = await api
            .post('/api/auth/login')
            .send({ password: 'wrong_password_test' })
            .expect(401)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.error, 'invalid password')
    })

    test('3. GET /me returns current status when a valid token is provided', async () => {
        const response = await api
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.role, 'admin')
    })

    test('4. POST /logout succeeds when a valid token is provided', async () => {
        const response = await api
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validToken}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.message, 'Logged out successfully')
    })

    test('5. GET /me fails with status 401 if no token is provided', async () => {
        const response = await api
            .get('/api/auth/me')
            .expect(401)
            .expect('Content-Type', /application\/json/)

        // Assuming your middleware returns 'token missing' when the header is absent
        assert.strictEqual(response.body.error, 'token missing')
    })
})

// Close the Mongoose connection after all tests to allow the test process to exit
after(async () => {
    await mongoose.connection.close()
})