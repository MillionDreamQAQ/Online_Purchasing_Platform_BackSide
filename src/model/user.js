const mongoose = require('../db/mongodb');
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: {
        type: String,
        set(val) {
            return bcrypt.hashSync(val, 10);
        },
        select: false
    },
    quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }],
    receivedQuotations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReceivedQuotation' }],
});

const User = mongoose.model('User', UserSchema);
module.exports = { User };
