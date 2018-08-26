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

// const controls = {
//     reg: function (User, req, res) {
//         User.findOne({
//             email: req.body.email.toLowerCase()
//         }).then(user => {
//             console.log(req.body.email);
//             console.log(user);
//             if(user){
//                 let error = [{text: 'Email already registered!'}];
//                 res.render('users/register', {
//                     errors: error,
//                     name: req.body.name,
//                     title: 'Welcome'
//                 });
//             }
//             else{
//                 const newUser = new User({
//                     name: req.body.name,
//                     email: req.body.email.toLowerCase(),
//                     password: req.body.password,
//                     description: req.body.description,
//                 });
//                 bcrypt.genSalt(10, (err, salt)=>{
//                     bcrypt.hash(newUser.password, salt, (err, hash)=>{
//                         if(err) throw err;
//                         newUser.password = hash;
//                         newUser.save()
//                             .then(user=>{
//                                 req.flash('success_msg', 'Successfully registered ' + user.email+' and you may now log in!');
//                                 res.redirect('../');
//                             }).catch(err=>{
//                             console.log(err);
//                             return;
//                         });
//                     });
//                 });
//             }
//         });
//     },
//
// };

mongoose.model('users', UserSchema);
// module.exports = controls;