const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../helpers/auth');

//Load Schema model 'users'
require('../models/User');
const User = mongoose.model('users');

//User Login
//router.get('/login', (req, res)=>{
//    res.redirect('../');
//});

//User Register
router.get('/register', (req, res)=>{
    res.render('users/register');
});

//login post
router.post('/login', (req, res, next)=>{

    req.body.email = req.body.email.toLowerCase();
    if(req.body.rememberme){
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; //sets cookie to expire afer a week 
    }

    passport.authenticate('local', {
        successRedirect: '/posts',
        failureRedirect: '../',
        failureFlash: true
    })(req, res, next);
});

//register post
router.post('/register', (req, res)=>{
    var errors = [];
    if(!req.body.name){
        errors.push({text: 'Please insert your name'});
    }
    if(!req.body.email){
        errors.push({text: 'Please insert your email'});
    }
    if(req.body.password.length < 6){
        errors.push({text: 'Password must be at least 6 characters'})
    }
    if(!req.body.password){
        errors.push({text: 'Please insert your desired password'});
    }
    if(req.body.password != req.body.password2){
        errors.push({text: 'Password does not match'});
    }
    if(!req.body.description){
        errors.push({text: 'Please add a short description'});
    }
    
    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
    });}
    else{
        User.findOne({
        email: req.body.email.toLowerCase()
    }).then(user => {
        console.log(req.body.email);
        console.log(user);
        if(user){
           let error = [{text: 'Email already registered!'}];
           res.render('users/register', {
               errors: error,
               name: req.body.name,
               title: 'Welcome'
           });
        }
        else{
           const newUser = new User({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: req.body.password,
            description: req.body.description,
            }); 
            bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(user=>{
                    req.flash('success_msg', 'Successfully registered ' + user.email+' and you may now log in!');
                    res.redirect('../');
                }).catch(err=>{
                    console.log(err);
                    return;
                });
            });
          }); 
        }
    });   
    }
});

// logout user
router.get('/logout', ensureAuthenticated, (req, res) =>{
    req.logout();
    req.session.destroy(()=>{
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;