const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ensureAuthenticated} = require('../helpers/auth');

//Load Schema model 'post'
require('../models/Post');
require('../models/User');
const Post = mongoose.model('posts');
const User = mongoose.model('users');


//set conn

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
    const filetypes = /jpeg|jpg|png|TIFF/; //extensions - allowed filetypes/image format
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
            posts:posts, profile: true,
            name: req.user.name,
            description: req.user.description
        });
    })
});

//Renders the upload page
router.get('/upload', ensureAuthenticated, (req, res)=>{
    res.render('posts/upload');
});

//link to view image
router.get('/image/:filename', (req, res)=>{
    gfs.files.findOne({filename: req.params.filename}, (err, file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({
                err: 'No Image exists'
            });
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

//Edit Post
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    Post.findOne({
        _id: req.params.id,
        user: req.user.id
    })
    .then(post =>{
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
    const id = req.params.id;
    User.findOne({_id: id}).then( user => {//include the shared private post later
        if (user.id === req.user.id) {
            res.redirect('/posts');
        } else{
            Post.find({
                user: id,
                private: false
            })
                .sort({date: 'desc'})
                .then(posts => {
                    let NoResult = false,
                        Visitor = true;
                    if (posts.length > 0)
                        NoResult = true;
                    res.render('posts/index', {
                        posts,
                        name: user.name,
                        description: user.description,
                        profile: true,
                        NoResult, Visitor
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
//            if(!err){
//for local storage uncomment this if we need to switch to local and previous comments connected to this
//                fs.unlink("./public/uploads/" + req.file.filename, (errr)=>{
//                    if(errr){
//                        console.log('Error deleting the uploaded file!')
//                    }else{
//                        console.log('File successfully deleted!')
//                    }
//                });
//                console.log("1error: " + err);
//            }
            
            res.render('posts/upload',{ //this renders the index Make sure to edit handlebars file for showing the upload modal later (medium priority) /done
                errors: errors, //edit handlesbars for viewing errors later, remove {{errors}} from main layout then insert {{errors}} for every page or div that needs to display an error (low priority) /done
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
                postImage: req.file.filename,
                index: req.user.name+' '+req.body.title+' '+req.body.details,
            };
            new Post(newPost).save().then(post=>{
                req.flash('success_msg', 'Successfully added ' +
                         post.title + '!');
                res.redirect('/posts');
            })
        }
    });
});

router.post('/search', ensureAuthenticated, (req, res)=>{
    let search = req.body.search.trim();
    let profile = true;
    if(search)
        Post.find({user: req.user.id,
                   index: {$regex: search, $options: "$i"}})
            .sort({date:'desc'})
            .then(posts =>{
                if(posts.length > 0) {
                    let msg = ' result';
                    if(posts.length > 1)
                        msg = msg + 's';

                    res.render('posts/index', {
                        posts: posts,
                        name: req.user.name,
                        profile,
                        success_msg: posts.length + msg + " found for '" + search +"'",
                    });
                }else{
                    const error = "No results found for '" + search +"'";
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

//checks if the uploaded post is private or not
function isPrivate(a){
//    console.log(a);
    return a === '1';
}


//edit form process (editing data in db)
router.put('/:id', ensureAuthenticated, (req, res)=>{
    Post.findOne({
       _id: req.params.id,
        user: req.user.id
    }).then(post => {
        if(post){
        post.title = req.body.title;
        post.details = req.body.details;
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
    Post.findOne({_id: req.params.id, user: req.user.id}).then((post)=>{
        if(post) {
            gfs.remove({_id: post.postImage}).then(() => {
                Post.remove({
                    _id: req.params.id
                }).then(() => {
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