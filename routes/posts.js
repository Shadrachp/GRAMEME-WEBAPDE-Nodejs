const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ensureAuthenticated} = require('../helpers/auth');
const model = require('../models/Post');
const usrModel = require('../models/User');

//Load Schema model 'post'
require('../models/Post');
require('../models/User');
require('../models/Tag');

//Connect gridfs and mongo
Grid.mongo = mongoose.mongo;

//uri
const db = require('../config/database');
const conn = mongoose.createConnection(db.mongoURI);

let gfs;

conn.once('open', ()=>{
    //Initializes stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});

//Storage engine
const storage = new GridFsStorage({
    url: db.mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) =>{
            crypto.randomBytes(16, (err, buf) =>{
                if(err){
                    return reject(err);
                }
                const filename = buf.toString('hex') +path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketname: 'fs'
                };
                resolve(fileInfo);
            });
        });
    }
//const storage = multer.diskStorage({
//for multer no grid fs (local storage)
//    destination: './public/uploads/',
//    filename: (req, file, cb)=>{
//        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//    }
});

//Init upload with gridfs method
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) =>{
        validateType(file, cb);
    } 
}).single('upImage'); 
 
//Init upload (Local Storage)
//const upload = multer({
//    storage: storage,
//    fileFilter: (req, file, cb)=>{
//        validateType(file, cb);
//    }
//}).single('upImage');

//checks filetype of file if its not part of the list then return an error
function validateType(file, cb){
    const filetypes = /jpeg|jpg|png|tiff/; //extensions - allowed filetypes/image format
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname)
        return cb(null, true);
    return cb('Error: Invalid image format!');
}

//Post index page remember to make profile as index
router.get('/', ensureAuthenticated, (req, res)=>{
    model.getPosts(req.user.id).then(posts =>{
        res.render('posts/index', {
            posts:posts, profile: true,
            name: req.user.name,
            description: req.user.description
        });
    });
});

//Renders the upload page
router.get('/upload', ensureAuthenticated, (req, res)=>{
    res.render('posts/upload');
});

//link to view image
router.get('/image/:filename', (req, res)=>{
    model.getImg(req.params.filename).then(readstream=>{
        if(readstream)
            readstream.pipe(res);
    }, (err)=>{
        return res.status(404).json({
            err
        });
    });
});

//Edit Post
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    model.getEdit(req.params.id, req.user.id).then(post =>{
        if(post) {
            res.render('posts/edit', { //render profile
                post: post
            });
        }else{
            req.flash('error_msg', 'Unauthorized access');
            res.redirect('/posts');
        }
    });
});

//response to req view user profile
router.get('/profile/:id', ensureAuthenticated, (req, res)=>{
    usrModel.findUser(req.params.id).then(user=>{
        if (user.id === req.user.id) {
            res.redirect('/posts');
        } else{
            model.profile(req.params.id).then(posts=>{
                let NoResult = false;
                if (posts.length > 0)
                    NoResult = true;
                res.render('posts/index', {
                    posts,
                    name: user.name,
                    description: user.description,
                    profile: false,
                    NoResult,
                });
            });
        }
    });

});

//Process Form Post req for uploading or post a meme
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
            res.render('posts/upload',{ //this renders the index Make sure to edit handlebars file for showing the upload modal later (medium priority) /done
                errors: errors, //edit handlesbars for viewing errors later, remove {{errors}} from main layout then insert {{errors}} for every page or div that needs to display an error (low priority) /done
                title: req.body.title,
                details: req.body.details                
            });
            
        }else {
            const tags = req.body.tags.split(",");
            const newPost = {
                title: req.body.title,
                details: req.body.details,
                user: req.user.id,
                private: isPrivate(req.body.privacy),
                name: req.user.name,
                postImage: req.file.filename,
                tags: tags,
                index: req.user.name + ' ' + req.body.title + ' ' + req.body.details + ' ' + req.body.tags
            };
            model.upload(newPost).then( post=> {
                req.flash('success_msg', 'Successfully added ' +
                    post.title + '!');
                res.redirect('/posts');
            });
        }
    });
});

//checks if the uploaded post is private or not
function isPrivate(a){
//    console.log(a);
    return a === '1';
}

router.post('/search', ensureAuthenticated, (req, res)=>{
    let search = req.body.search.trim();
    let profile = true;
    if(search)
        model.fSearch(req.user.id, search).then(posts=>{
            if (posts.length > 0) {
                let msg = ' result';
                if (posts.length > 1)
                    msg = msg + 's';

                res.render('posts/index', {
                    posts: posts,
                    name: req.user.name,
                    profile,
                    success_msg: posts.length + msg + " found for '" + search + "'",
                });
            } else {
                const error = "No results found for '" + search + "'";
                req.flash('error_msg', error);
                res.render('posts/index', {
                    error, profile,
                    NoResult: true
                });
            }
        });
    else{
        const error = 'Search field is empty';
        req.flash('error_msg', error);
        res.redirect('/posts');
    }
});

router.post('/tags/:tag', ensureAuthenticated, (req, res)=>{
    const tag = req.params.tag;
    let profile = true;
    model.searchTag(tag).then(posts=>{
        console.log(posts);
        if(posts.length > 0) {
            let msg = ' result';
            if(posts.length > 1)
                msg = msg + 's';
            res.render('posts/index', {
                posts: posts,
                name: req.user.name,
                profile,
                success_msg: posts.length + msg + " found for '" + tag +"'",
            });
        }else{
            const error = "No results found for '" + tag +"'";
            req.flash('error_msg', error);
            res.render('posts/index', {
                error, profile,
                NoResult: true
            });
        }
    });
});


//edit form process
router.put('/:id', ensureAuthenticated, (req, res)=>{
    model.edit(req.params.id, req.user.id).then(post =>{
        if(post){
            post.title = req.body.title;
            post.details = req.body.details;
            post.tags = req.body.tags.split(",");
            post.index = req.user.name + ' ' + req.body.title + ' ' + req.body.details + ' ' + req.body.tags;
            post.save()
                .then(post => {
                    req.flash('success_msg', post.title + ' successfully edited!');
                    res.redirect('/posts')
                });
        }else{
            req.flash('error_msg', 'Error editing meme!');
            res.redirect('/posts');
        }
    });
});

//deleting a post
router.delete('/:id', ensureAuthenticated, (req, res)=>{
   model.pDelete(req.params.id, req.user.id).then(post =>{
       if(post) {
           model.gfsDel(post.postImage).then(()=>{
               model.pRemove(req.params.id).then(()=>{
                   req.flash('success_msg', 'Meme successfully deleted!');
                   res.redirect('/posts');
               });
           });
       }else{
           req.flash('error_msg', 'Error deleting meme!');
           res.redirect('/posts');
       }
   });
});

module.exports = router;