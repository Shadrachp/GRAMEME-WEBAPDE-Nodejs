const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const PostSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    details:{
        type: String,
        required: true
    }, 
    user:{
        type: String,
        required: true
    },
    postImage:{
        type: String,
        required: false //temporarily false
    },
    tags:{
      type:Array,
      default: [] //temporarily false there should be at least one tag later
    },
    date:{
        type: Date,  
        default: Date.now
    }
});

mongoose.model('posts', PostSchema);