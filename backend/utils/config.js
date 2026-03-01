require('dotenv').config()

const PORT = process.env.PORT || 3000
const SECRET = process.env.SECRET
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

let MONGODB_URI

if (process.env.NODE_ENV === 'test') {
    MONGODB_URI = process.env.MONGODB_URI_TEST
} else if (process.env.NODE_ENV === 'dev') {
    MONGODB_URI = process.env.MONGODB_URI_DEV
} else {
    MONGODB_URI = process.env.MONGODB_URI
}

module.exports = {
    PORT,
    SECRET,
    ADMIN_PASSWORD,
    MONGODB_URI
}