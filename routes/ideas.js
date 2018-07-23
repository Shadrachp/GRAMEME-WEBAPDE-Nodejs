const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const flash = require('connect-flash');
const {ensureAuthenticated} = require('../helpers/auth');



//Load Schema model 'idea'
require('../models/Idea');
const Idea = mongoose.model('ideas');

//router.use(flash());

//Idea index page
router.get('/', ensureAuthenticated, (req, res)=>{
    Idea.find({user: req.user.id})
    .sort({date:'desc'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas:ideas
        });
    })
    
});

//Add Idea
router.get('/add', ensureAuthenticated,  (req, res)=>{
    res.render('ideas/add');
});

//Edit Idea
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea =>{
        if(idea.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/ideas');
        }else{
            res.render('ideas/edit', {
            idea:idea
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
        res.render('ideas/add',{
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else{
        const newIdea ={
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newIdea).save().then(idea=>{
            req.flash('success_msg', 'Successfully added ' +
                     idea.title + '!');
            res.redirect('/ideas');
        })
    }
})


//edit form process (editing the db)
router.put('/:id', ensureAuthenticated,(req, res)=>{
    Idea.findOne({
       _id: req.params.id
    }).then(idea =>{
        idea.title = req.body.title;
        idea.details = req.body.details;
//        idea.date = Date.now;
        
        idea.save()
        .then(idea => {
            req.flash('success_msg', 'Video idea successfully edited!')
            res.redirect('/ideas')
        });
    });
});

router.delete('/:id', ensureAuthenticated, (req, res)=>{
        Idea.remove({
            _id: req.params.id
        }).then(()=>{
            req.flash('success_msg', 'Video Idea deleted!');
            res.redirect('/ideas');
        });
});


module.exports = router;