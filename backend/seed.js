const mongoose = require('mongoose')
const Quiz = require('./models/quiz')
const Entrance = require('./models/entrance')
const Submission = require('./models/submission')
const config = require('./utils/config')

const MONGODB_URI = config.MONGODB_URI

// Note: This script will WIPE your existing database and seed it with fresh mock data.
const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB successfully.')

        console.log('Clearing existing data...')
        await Quiz.deleteMany({})
        await Entrance.deleteMany({})
        await Submission.deleteMany({})
        console.log('Old data cleared.')

        // ==========================================
        // 1. Create Quizzes (Templates)
        // ==========================================
        console.log('Seeding Quizzes...')
        const quiz1 = new Quiz({
            name: 'Python Fundamentals Midterm',
            description: 'Covers variables, loops, and basic data structures.',
            questions: {
                title: 'Python Fundamentals',
                subtitle: 'Term 1',
                points: 10,
                questions: [
                    {
                        Q: 'Which of the following is used to define a function in Python?',
                        options: [
                            { opt: 'A. func', correct: false },
                            { opt: 'B. def', correct: true },
                            { opt: 'C. function', correct: false }
                        ]
                    },
                    {
                        Q: 'Which data types are mutable in Python? (Select all that apply)',
                        options: [
                            { opt: 'A. List', correct: true },
                            { opt: 'B. Tuple', correct: false },
                            { opt: 'C. Dictionary', correct: true },
                            { opt: 'D. String', correct: false }
                        ]
                    },
                    {
                        Q: 'Fill in the blank to print "Hello World": ___("Hello World")',
                        itext: ''
                    }
                ]
            }
        })

        const quiz2 = new Quiz({
            name: 'React Hooks Quick Test',
            description: 'Short quiz testing useState and useEffect.',
            questions: {
                title: 'React Hooks',
                points: 5,
                questions: [
                    {
                        Q: 'What hook is used to manage local state in a functional component?',
                        options: [
                            { opt: 'A. useEffect', correct: false },
                            { opt: 'B. useState', correct: true },
                            { opt: 'C. useContext', correct: false }
                        ]
                    }
                ]
            }
        })

        const savedQuiz1 = await quiz1.save()
        const savedQuiz2 = await quiz2.save()

        // ==========================================
        // 2. Create Entrances (Exam Sessions)
        // ==========================================
        console.log('Seeding Entrances...')
        const entrance1 = new Entrance({
            quizId: savedQuiz1._id,
            accessCode: 'PYM1',
            name: 'Monday Morning Python Class',
            description: 'Strictly for Class A students.',
            isActive: true
        })

        const entrance2 = new Entrance({
            quizId: savedQuiz1._id,
            accessCode: 'PYA2',
            name: 'Afternoon Python Retake',
            isActive: false // Closed session
        })

        const entrance3 = new Entrance({
            quizId: savedQuiz2._id,
            accessCode: 'RCT1',
            name: 'React Weekend Bootcamp',
            isActive: true
        })

        const savedEnt1 = await entrance1.save()
        await entrance2.save()
        const savedEnt3 = await entrance3.save()

        // ==========================================
        // 3. Create Submissions (Student Answers)
        // ==========================================
        console.log('Seeding Submissions...')

        // Student 1: Perfect Score on Python Quiz (Entrance 1)
        const submission1 = new Submission({
            entranceId: savedEnt1._id,
            studentName: 'Alice Smith',
            totalScore: 20, // 10 for Q1, 10 for Q2, 0 for Q3 (subjective)
            answers: {
                point: 10,
                totalScore: 20,
                questions: [
                    { selections: ['B. def'], point: 10 },
                    { selections: ['A. List', 'C. Dictionary'], point: 10 },
                    { answer: 'print', point: 0 }
                ]
            }
        })

        // Student 2: Failed Python Quiz (Entrance 1)
        const submission2 = new Submission({
            entranceId: savedEnt1._id,
            studentName: 'Bob Jones',
            totalScore: 0, // Got everything wrong
            answers: {
                point: 10,
                totalScore: 0,
                questions: [
                    { selections: ['A. func'], point: 0 },
                    { selections: ['A. List'], point: 0 }, // Missed C. Dictionary
                    { answer: 'console.log', point: 0 }
                ]
            }
        })

        // Student 3: Passed React Quiz (Entrance 3)
        const submission3 = new Submission({
            entranceId: savedEnt3._id,
            studentName: 'Charlie Brown',
            totalScore: 5,
            answers: {
                point: 5,
                totalScore: 5,
                questions: [
                    { selections: ['B. useState'], point: 5 }
                ]
            }
        })

        await submission1.save()
        await submission2.save()
        await submission3.save()

        console.log('==========================================')
        console.log('Database seeded successfully! 🌱')
        console.log('You can now test with the following active Access Codes:')
        console.log('1. PYM1 (Python Midterm)')
        console.log('2. RCT1 (React Hooks)')
        console.log('==========================================')

        // Gracefully exit the script
        process.exit(0)
    } catch (error) {
        console.error('Error seeding database:', error)
        process.exit(1)
    }
}

seedDatabase()