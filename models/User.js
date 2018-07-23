const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    
    //remove email later
    email:{
        type: String,
        required: true
    }, 
    
    password:{
        type: String,
        required: true
    }, 
    
    description:{
        type: String,
        required: false
    },
    
    date:{
        type: Date,  
        default: Date.now
    }
});

mongoose.model('users', UserSchema);