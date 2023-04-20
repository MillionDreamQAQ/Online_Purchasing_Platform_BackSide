const mongoose = require('../db/mongodb')

const QuotationSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: Date.now.valueOf(),
    },
    quotationName: {
        type: String,
        unique: true,
    },
    template: {
        type: Array,
    },
    selectedTemplate: {
        type: Array,
    }
})

const Quotation = mongoose.model('Quotation', QuotationSchema)
module.exports = { Quotation }