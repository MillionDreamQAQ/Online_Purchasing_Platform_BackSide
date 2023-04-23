const mongoose = require('../db/mongodb');

const TemplateSchema = new mongoose.Schema({
    key: { type: Number, unique: true, index: true },
    name: String,
    size: String,
    count: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    unit: String,
    desc: String
});
const Template = mongoose.model('Template', TemplateSchema);
module.exports = { Template };
