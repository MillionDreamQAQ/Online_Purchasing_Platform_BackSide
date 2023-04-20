const mongoose = require('../../db/mongodb2')

const TemplateSchema = new mongoose.Schema({
    key: {type: String, unique: true},
    name: String,
    size: String,
    unit: String,
    desc: String
});
const Template = mongoose.model('Template', TemplateSchema);
module.exports = { Template }