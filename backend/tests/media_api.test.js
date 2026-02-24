const { test, describe, after, before } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const fs = require('fs')
const path = require('path')
const app = require('../app')
const mongoose = require('mongoose')
const config = require('../utils/config')

const api = supertest(app)

describe('Media Upload API (/api/media)', () => {
    let validToken = ''
    // Keep track of uploaded filenames to clean up the filesystem after tests
    const uploadedFiles = []

    // 1. Fetch Admin Token
    before(async () => {
        const loginResponse = await api
            .post('/api/auth/login')
            .send({ password: config.ADMIN_PASSWORD })
        validToken = loginResponse.body.token
    })

    describe('1. Happy Path: Successful image upload', () => {
        test('succeeds with status 201 and returns a valid UUID filename and URL', async () => {
            // Create a 1KB dummy file directly in memory
            const dummyImageBuffer = Buffer.alloc(1024, 'I am a fake image content')

            const response = await api
                .post('/api/media/upload')
                .set('Authorization', `Bearer ${validToken}`)
                // Use Supertest's .attach() to simulate form-data file upload
                // The field name 'image' must strictly match multer's upload.single('image')
                .attach('image', dummyImageBuffer, 'test_image.png')
                .expect(201)
                .expect('Content-Type', /application\/json/)

            // Assert response structure
            assert.ok(response.body.filename)
            assert.ok(response.body.url)

            // Strict assertion: Filename must match UUID v4 format with a .png extension
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i
            assert.match(response.body.filename, uuidRegex)
            assert.strictEqual(response.body.url, `/uploads/${response.body.filename}`)

            // Store the generated filename for cleanup
            uploadedFiles.push(response.body.filename)
        })
    })

    describe('2. Security & Edge Cases (Anti-Cheating & Validation)', () => {
        test('fails with status 401 if token is missing', async () => {
            const dummyBuffer = Buffer.alloc(1024, 'data')
            await api
                .post('/api/media/upload')
                .attach('image', dummyBuffer, 'test.png')
                .expect(401)
        })

        test('fails with status 400 if field name is wrong (e.g., "picture" instead of "image")', async () => {
            const dummyBuffer = Buffer.alloc(1024, 'data')
            const response = await api
                .post('/api/media/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('picture', dummyBuffer, 'test.png') // Intentionally use the wrong field name
                .expect(400)

            // Multer throws an 'Unexpected field' error when the expected 'image' key is missing
            assert.ok(response.body.error.includes('Unexpected field') || response.body.error.includes('No valid image'))
        })

        test('fails with status 400 if no file is attached', async () => {
            const response = await api
                .post('/api/media/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ someData: 'but no file' }) // No file attached
                .expect(400)

            assert.strictEqual(response.body.error, 'No valid image file uploaded')
        })

        test('FILE FILTER: fails with status 400 if trying to upload a non-image file (e.g., .pdf)', async () => {
            const dummyBuffer = Buffer.alloc(1024, 'I am a malicious PDF script')

            const response = await api
                .post('/api/media/upload')
                .set('Authorization', `Bearer ${validToken}`)
                // Supertest automatically infers the application/pdf MIME type from the .pdf extension
                .attach('image', dummyBuffer, 'malicious_document.pdf')
                .expect(400)

            // Assert our custom fileFilter successfully blocks non-image uploads
            assert.strictEqual(response.body.error, 'Only image files are allowed!')
        })

        test('FILE SIZE LIMIT: fails with status 400 if file is larger than 5MB', async () => {
            // Limit test: Create a massive 6MB file in memory
            const massiveBuffer = Buffer.alloc(30 * 1024 * 1024, '0')

            const response = await api
                .post('/api/media/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('image', massiveBuffer, 'huge_image.jpg')
                .expect(400)

            // Assert Multer's fileSize limit (5MB) successfully blocks the upload
            assert.strictEqual(response.body.error, 'File too large')
        })
    })

    // Ultimate Cleanup Mechanism: Physically delete all generated test files to keep the storage clean!
    after(async () => {
        const uploadDir = path.join(__dirname, '../uploads')

        uploadedFiles.forEach(filename => {
            const filePath = path.join(uploadDir, filename)
            // Check if the file exists, then delete it
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        })
        await mongoose.connection.close()
    })
})