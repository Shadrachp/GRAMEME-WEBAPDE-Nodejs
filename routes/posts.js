const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {ensureAuthenticated} = require('../helpers/auth');

//Load Schema model 'post'
require('../models/Post');
const Post = mongoose.model('posts');

//Storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Init upload
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb)=>{
        validateType(file, cb);
    }
}).single('upImage');

function validateType(file, cb){
    const filetypes = /jpeg|jpg|png/; //extensions
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname)
        return cb(null, true);
    return cb('Error: Invalid image format!');
}

//Post index page remember to make profile as index
router.get('/', ensureAuthenticated, (req, res)=>{
    Post.find({user: req.user.id})
    .sort({date:'desc'})
    .then(posts =>{
        res.render('posts/index', {
            posts:posts,
            name: req.user.name
        });
    })
});

//Renders the upload page
router.get('/upload', ensureAuthenticated, (req, res)=>{
    res.render('posts/upload');
});

//Edit Post
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    Post.findOne({
        _id: req.params.id
    })
    .then(post =>{
        if(post.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/posts');
        }else{
            res.render('posts/index', { //render profile
            post:post
        }   );
        }
    });
})

//Process Form
router.post('/upload', ensureAuthenticated, (req, res)=>{
    let errors = [];
    upload(req, res, (err)=>{
        if(err){
            errors.push({text: err});
        }else{
            if(!req.body.title)
                errors.push({text:'Please add a title'});
            if(!req.body.details)
                errors.push({text: 'Please add some description'})
        } 
        if(errors.length>0){
            if(!err){
                fs.unlink("./public/uploads/" + req.file.filename, (errr)=>{
                    if(errr){
                        console.log('Error deleting the uploaded file!')
                    }else{
                        console.log('File successfully deleted!')
                    }
                });
            }
            res.render('posts/upload',{ //this renders the index Make sure to edit handlebars file for showing the upload modal later (medium priority)
                errors: errors, //edit handlesbars for viewing errors later, remove {{errors}} from main layout then insert {{errors}} for every page or div that needs to display an error (low priority)
                title: req.body.title,
                details: req.body.details
            });
        }else{
            const newPost ={
                title: req.body.title,
                details: req.body.details,
                user: req.user.id,
                private: isPrivate(req.body.privacy),
                name: req.user.name,
                postImage: req.file.path.substring(6)
            }
            new Post(newPost).save().then(post=>{
                req.flash('success_msg', 'Successfully added ' +
                         post.title + '!');
                res.redirect('/posts');
            })
        }
    });
})

//function imgUpload(req, res, tempdata, errors){
//    
//}


function isPrivate(a){
//    console.log(a);
    if(a == '1')
        return true;
    return false;
}

//edit form process (editing data in db)
router.put('/:id', ensureAuthenticated,(req, res)=>{
    Post.findOne({
       _id: req.params.id
    }).then(post =>{
        post.title = req.body.title;
        post.details = req.body.details;
        post.save()
        .then(post => {
            req.flash('success_msg', 'Meme successfully edited!')
            res.redirect('/posts')
        });
    });
});

//deleting a post
router.delete('/:id', ensureAuthenticated, (req, res)=>{
        Post.remove({
            _id: req.params.id
        }).then(()=>{
            req.flash('success_msg', 'Meme successfully deleted!');
            res.redirect('/posts');
        });
});


module.exports = router;