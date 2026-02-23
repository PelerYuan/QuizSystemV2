const Quiz = require('../models/quiz')
const Entrance = require('../models/entrance')

// Mock data strictly follows the database Schema and the required JSON format
const initialQuizzes = [
    {
        name: "Midterm Python Fundamentals",
        description: "Covers basic Python concepts for Term 2",
        questions: {
            title: "PYTHON QUIZ TRIAL",
            subtitle: "Term 2",
            points: 1,
            questions: [
                {
                    Q: "What is the value of new_number variable?",
                    image: "7e8deb56-52f8-4472-a115-e9b1cd51214f.png",
                    options: [
                        { opt: "a. 21" },
                        { opt: "b. 33", correct: true },
                        { opt: "c. 11" }
                    ]
                },
                {
                    Q: "Fill the ___ in the following code:",
                    itext: ""
                }
            ]
        }
    },
    {
        name: "React Hooks Assessment",
        description: "Full stack development basics test",
        questions: {
            title: "React Hooks Quiz",
            points: 2,
            questions: [
                {
                    Q: "Which hook is used for managing state?",
                    options: [
                        { opt: "useEffect" },
                        { opt: "useState", correct: true },
                        { opt: "useContext" }
                    ]
                }
            ]
        }
    }
]

const quizzesInDb = async () => {
    const quizzes = await Quiz.find({})
    return quizzes.map(quiz => quiz.toJSON())
}

// Generate an ID that is structurally valid for MongoDB, but does not belong to any quiz
const nonExistingId = async () => {
    const quiz = new Quiz({
        name: 'willremovethissoon',
        questions: { title: "Temporary" }
    })
    await quiz.save()
    await quiz.deleteOne()

    return quiz._id.toString()
}

// Fetch all entrances currently in the database
const entrancesInDb = async () => {
    const entrances = await Entrance.find({})
    return entrances.map(e => e.toJSON())
}

// Generate an ID that is valid but does not exist in the Entrance collection
const nonExistingEntranceId = async () => {
    // Note: quizId doesn't matter here since we just want to generate and delete a valid Entrance ID
    const entrance = new Entrance({
        quizId: "123456789012345678901234", // Dummy ObjectId
        accessCode: "TEMP",
        name: "willremovethissoon",
        isActive: false
    })
    await entrance.save()
    await entrance.deleteOne()

    return entrance._id.toString()
}

module.exports = {
    initialQuizzes,
    quizzesInDb,
    nonExistingId,
    entrancesInDb,
    nonExistingEntranceId
}