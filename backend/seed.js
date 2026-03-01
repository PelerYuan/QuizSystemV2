const mongoose = require('mongoose')
const Quiz = require('./models/quiz')
const Entrance = require('./models/entrance')
const Submission = require('./models/submission')
const config = require('./utils/config')

const MONGODB_URI = config.MONGODB_URI

// Random name generator vocabulary
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];

const getRandomName = () => {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)]
    const last = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${first} ${last}`
}

// Random timestamp generator (simulating submissions within the last 2 hours)
const getRandomTimestamp = () => {
    const now = Date.now()
    const offset = Math.floor(Math.random() * (2 * 60 * 60 * 1000)) // 0 ~ 2 hours
    return new Date(now - offset)
}

const seedDatabase = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB successfully.')

        console.log('🧹 Clearing existing data (Quizzes, Entrances, Submissions)...')
        await Quiz.deleteMany({})
        await Entrance.deleteMany({})
        await Submission.deleteMany({})
        console.log('✅ Old data cleared.')

        // ==========================================
        // 1. Create Quizzes (Templates)
        // ==========================================
        console.log('📝 Seeding Quizzes...')
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
        console.log('🚪 Seeding Entrances...')
        const entrance1 = new Entrance({
            quizId: savedQuiz1._id,
            accessCode: 'PYM1',
            name: 'Monday Morning Python Class',
            description: 'Strictly for Class A students. Analytics will look great here!',
            isActive: true
        })

        const entrance2 = new Entrance({
            quizId: savedQuiz1._id,
            accessCode: 'PYA2',
            name: 'Afternoon Python Retake',
            isActive: false
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
        // 3. Create Bulk Submissions (Simulate 60 Students)
        // ==========================================
        console.log('👨‍🎓👩‍🎓 Seeding Bulk Submissions for Analytics...')

        const submissionsArray = []

        // --- Python Exam Answer Patterns (Max Score: 20) ---
        const pythonAnswerPatterns = [
            { s1: ['B. def'], p1: 10, s2: ['A. List', 'C. Dictionary'], p2: 10, text: 'print', score: 20 }, // Perfect
            { s1: ['B. def'], p1: 10, s2: ['A. List'], p2: 5, text: 'print', score: 15 }, // Half correct multiple choice
            { s1: ['B. def'], p1: 10, s2: ['B. Tuple'], p2: 0, text: 'printf', score: 10 }, // Wrong multiple choice
            { s1: ['A. func'], p1: 0, s2: ['A. List', 'C. Dictionary'], p2: 10, text: 'console.log', score: 10 }, // First question wrong
            { s1: ['C. function'], p1: 0, s2: ['C. Dictionary'], p2: 5, text: 'echo', score: 5 }, // Poor performance
            { s1: ['A. func'], p1: 0, s2: ['D. String'], p2: 0, text: 'display', score: 0 } // Zero score
        ]

        // Generate 45 Python exam submissions
        for (let i = 0; i < 45; i++) {
            // Simulate a realistic distribution (most pass, few perfect/zero scores) using skewed random index
            const patternIndex = Math.floor(Math.random() * Math.random() * pythonAnswerPatterns.length)
            const pattern = pythonAnswerPatterns[patternIndex] || pythonAnswerPatterns[2]

            submissionsArray.push({
                entranceId: savedEnt1._id,
                studentName: getRandomName(),
                totalScore: pattern.score,
                submittedAt: getRandomTimestamp(),
                answers: {
                    point: 10,
                    totalScore: pattern.score,
                    questions: [
                        { selections: pattern.s1, point: pattern.p1 },
                        { selections: pattern.s2, point: pattern.p2 },
                        { answer: pattern.text, point: 0 }
                    ]
                }
            })
        }

        // --- React Exam Answer Patterns (Max Score: 5) ---
        const reactAnswerPatterns = [
            { s: ['B. useState'], p: 5 },
            { s: ['A. useEffect'], p: 0 },
            { s: ['C. useContext'], p: 0 }
        ]

        // Generate 15 React exam submissions
        for (let i = 0; i < 15; i++) {
            // 70% correct rate
            const isCorrect = Math.random() > 0.3
            const pattern = isCorrect ? reactAnswerPatterns[0] : reactAnswerPatterns[Math.floor(Math.random() * 2) + 1]

            submissionsArray.push({
                entranceId: savedEnt3._id,
                studentName: getRandomName(),
                totalScore: pattern.p,
                submittedAt: getRandomTimestamp(),
                answers: {
                    point: 5,
                    totalScore: pattern.p,
                    questions: [
                        { selections: pattern.s, point: pattern.p }
                    ]
                }
            })
        }

        // Bulk insert into database
        await Submission.insertMany(submissionsArray)
        console.log(`✅ Successfully seeded ${submissionsArray.length} student submissions!`)

        console.log('\n==========================================')
        console.log('🌟 Database seeded successfully! 🌟')
        console.log('You can now test Analytics with the following active Access Codes:')
        console.log('1. PYM1 (Monday Morning Python Class) -> Has 45 submissions')
        console.log('2. RCT1 (React Weekend Bootcamp) -> Has 15 submissions')
        console.log('==========================================\n')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    }
}

seedDatabase()