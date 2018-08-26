const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ensureAuthenticated} = require('../helpers/auth');
const controller = require('../models/Post');
//Load Schema model 'post'
require('../models/Post');
require('../models/User');
require('../models/Tag');
const Post = mongoose.model('posts');
const User = mongoose.model('users');
const Tag = mongoose.model('tags');


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
    const filetypes = /jpeg|jpg|png|tiff/; //extensions - allowed filetypes/image format
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname)
        return cb(null, true);
    return cb('Error: Invalid image format!');
}

//Post index page remember to make profile as index
router.get('/', ensureAuthenticated, (req, res)=>{
    controller.getPosts(Post, req, res);
});

//Renders the upload page
router.get('/upload', ensureAuthenticated, (req, res)=>{
    res.render('posts/upload');
});

//link to view image
router.get('/image/:filename', (req, res)=>{
    controller.getImg(gfs, req, res);
});

//Edit Post
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    controller.getEdit(Post, req, res);
});

//response to req view user profile
router.get('/profile/:id', ensureAuthenticated, (req, res)=>{
    controller.profile(User, Post, req, res);
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
            controller.upload(Post, req ,res);
        }
    });
});

router.post('/search', ensureAuthenticated, (req, res)=>{
    let search = req.body.search.trim();
    let profile = true;
    if(search)
        controller.fSearch(Post, req, res, profile);
    else{
        const error = 'Search field is empty';
        req.flash('error_msg', error);
        res.redirect('/posts');
    }
});

router.post('/tags/:tag', ensureAuthenticated, (req, res)=>{
    controller.searchTag(Post, req, res);
});
//checks if the uploaded post is private or not



//edit form process (editing data in db)
router.put('/:id', ensureAuthenticated, (req, res)=>{
    controller.edit(Post, req, res);
});

//deleting a post
router.delete('/:id', ensureAuthenticated, (req, res)=>{
   controller.pDelete(Post, gfs, req, res)
});


module.exports = router;