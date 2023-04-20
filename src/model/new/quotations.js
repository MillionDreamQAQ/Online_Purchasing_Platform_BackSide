const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    quotationName: String,
    template: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }],
    selectedTemplate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }]
});

const Quotation = mongoose.model('Quotation', QuotationSchema)
module.exports = { Quotation }