const mongoose = require('../db/mongodb');

const QuotationSchema = new mongoose.Schema({
    key: { type: Number, unique: true, index: true },
    publishedLocked: { type: Boolean, default: false },
    quotationName: String,
    template: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }],
    selectedTemplate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }]
});

const Quotation = mongoose.model('Quotation', QuotationSchema);
module.exports = { Quotation };
