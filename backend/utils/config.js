require('dotenv').config()

const PORT = process.env.PORT | 3000
const SECRET = process.env.SECRET
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_URI_TEST
    : process.env.MONGODB_URI_DEV

module.exports = {
    PORT,
    SECRET,
    ADMIN_PASSWORD,
    MONGODB_URI
}