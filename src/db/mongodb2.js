const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/backend_2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = mongoose;
