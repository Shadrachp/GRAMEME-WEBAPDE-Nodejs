const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');



//Load Schema model 'post'
require('../models/Post');
const Post = mongoose.model('posts');



//Post index page remember to make profile as index
router.get('/', ensureAuthenticated, (req, res)=>{
    Post.find({user: req.user.id})
    .sort({date:'desc'})
    .then(posts =>{
        res.render('posts/index', {
            posts:posts
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
router.post('/', ensureAuthenticated, (req, res)=>{
    let errors = [];
    if(!req.body.title)
        errors.push({text:'Please add a title'});
    if(!req.body.details)
        errors.push({
            text: 'Please add some details'
        })
    
    if(errors.length>0){  
        res.render('/posts',{ //this renders the index Make sure to edit handlebars file for showing the upload modal later (medium priority)
            errors: errors, //edit handlesbars for viewing errors later, remove {{errors}} from main layout then insert {{errors}} for every page or div that needs to display an error (low priority)
            title: req.body.title,
            details: req.body.details
        });
    }else{
        const newPost ={
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Post(newPost).save().then(post=>{
            req.flash('success_msg', 'Successfully added ' +
                     post.title + '!');
            res.redirect('/posts');
        })
    }
})


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