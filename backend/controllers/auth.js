const jwt = require('jsonwebtoken')
const authRouter = require('express').Router()
const config = require('../utils/config')

authRouter.post('/login', async (request, response) => {
    const {password} = request.body

    if (password !== config.ADMIN_PASSWORD) {
        return response.status(401).json({error: 'invalid password'})
    }

    const payloadForToken = {
        role: 'admin'
    }

    const token = jwt.sign(payloadForToken, config.SECRET, {expiresIn: 60*60}) // 1-hour expired

    response.status(200).send({token, role: 'admin'})
})

authRouter.get('/me', async (request, response) => {
    if (!request.token) {
        return response.status(401).json({error: 'token missing'})
    }

    const decodedToken = jwt.verify(request.token, config.SECRET)

    response.status(200).json({role: decodedToken.role})
})

authRouter.post('/logout', async (request, response) => {
    if (!request.token) {
        return response.status(401).json({error: 'token missing'})
    }

    jwt.verify(request.token, config.SECRET)

    response.status(200).json({message: 'Logged out successfully'})
})

module.exports = authRouter