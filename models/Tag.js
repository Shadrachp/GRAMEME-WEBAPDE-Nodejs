const mongoose = require('mongoose')

var Tags = new TagSchema({
    name: {
        type: String,
        required: true
    },
    posts: {
        type: Array,
        default: []
    }
})

mongoose.model('tags', TagSchema);