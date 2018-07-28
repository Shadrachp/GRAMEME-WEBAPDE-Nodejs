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
    user:{ //id of user who posted it
        type: String,
        required: true
    },
    name:{
        type: String,//name of user
        required: true 
    }
    ,
    postImage:{
        type: String,
        required: false //temporarily false
    },
    tags:{
      type: Array,
      default: []
    },
    private: {
        type: Boolean,
        required: true
    },
    shared:{
        type:Array,
        default:[] //array of user id
    },
    date:{
        type: Date,  
        default: Date.now
    }
});

mongoose.model('posts', PostSchema);