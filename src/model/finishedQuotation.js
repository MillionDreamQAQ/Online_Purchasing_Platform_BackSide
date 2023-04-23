const mongoose = require('../db/mongodb');

const FinishedQuotationSchema = new mongoose.Schema({
    key: { type: Number, unique: true, index: true },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quotation: { type: mongoose.Schema.Types.Mixed }
});

const FinishedQuotation = mongoose.model('FinishedQuotation', FinishedQuotationSchema);
module.exports = { FinishedQuotation };
