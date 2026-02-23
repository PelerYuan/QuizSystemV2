const mongoose = require('mongoose')

const entranceSchema = new mongoose.Schema({
    quizID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    accessCode: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
}, {timestamps: true})

entranceSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Entrance', entranceSchema)