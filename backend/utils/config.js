require('dotenv').config()

const PORT = process.config.PORT | 3000
const MONGODB_URL = process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_URL_TEST
    : process.env.MONGODB_URI_DEV

module.exports = {
    PORT,
    MONGODB_URL
}