const mediaRouter = require('express').Router()
const multer = require('multer')
const {v4: uuidv4} = require('uuid')
const path = require('path')
const middleware = require('../utils/middleware')

mediaRouter.use(middleware.verifyAdmin)

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (request, file, cb) => {
        const ext = path.extname(file.originalname)
        const uniqueFilename = `${uuidv4()}${ext}`
        cb(null, uniqueFilename)
    }
})

const fileFilter = (request, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only image files are allowed!'), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 20 * 1024 * 1024} // 20MB maximum per image
})

mediaRouter.post('/upload', upload.single('image'), (request, response) => {
    if (!request.file) {
        return response.status(400).json({error: 'No valid image file uploaded'})
    }

    response.status(201).json({
        filename: request.file.filename,
        url: `/uploads/${request.file.filename}`
    })
})

mediaRouter.use((error, request, response, next) => {
    if (error instanceof multer.MulterError) {
        return response.status(400).json({error: error.message})
    } else if (error) {
        return response.status(400).json({error: error.message})
    }
    next()
})

module.exports = mediaRouter