const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    posts: {
        type: Array,
        default: []
    }
});

mongoose.model('tags', TagSchema);