const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/test', (req, res) => {
    res.json({ message: "API is working!" })
})

// 路由挂载在这里，例如：
// const quizRouter = require('./controllers/quizzes')
// app.use('/api/quizzes', quizRouter)

module.exports = app