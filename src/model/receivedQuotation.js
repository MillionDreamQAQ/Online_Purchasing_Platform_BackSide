const mongoose = require('../db/mongodb');

const ReceivedQuotationSchema = new mongoose.Schema({
    key: { type: Number, unique: true, index: true },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }
});

const ReceivedQuotation = mongoose.model('ReceivedQuotation', ReceivedQuotationSchema);
module.exports = { ReceivedQuotation };
