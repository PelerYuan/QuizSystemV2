const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    entranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrance',
        required: true,
    },
    studentName: {
            type: String,
            required: true
    },
    answers: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    totalScore: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
})

submissionSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Submission', submissionSchema)