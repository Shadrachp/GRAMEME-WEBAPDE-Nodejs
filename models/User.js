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
        required: true
    },
    
    date:{
        type: Date,  
        default: Date.now
    }
});

const User = mongoose.model("user", UserSchema);

const model = {
    findUser: function (id) {
        return new Promise((resolve, reject)=>{
            User.findOne({_id: id}).then( user => {//include the shared private post later
                resolve(user);
            }, (err)=>{
                reject(err);
            });
        });
    },
    findName: function (name) {
        return new Promise((resolve, reject)=>{
            User.findOne({name: name}).then( user => {//include the shared private post later
                resolve(user);
            }, (err)=>{
                reject(err);
            });
        });
    },

};

mongoose.model('users', UserSchema);
module.exports = model;