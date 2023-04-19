const mongoose = require('../db/mongodb')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        set(val){
            return bcrypt.hashSync(val, 10)
        },
        select: false
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema)
module.exports = { User }