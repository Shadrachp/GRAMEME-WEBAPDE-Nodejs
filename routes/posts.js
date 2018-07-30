const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {ensureAuthenticated} = require('../helpers/auth');

//Load Schema model 'post'
require('../models/Post');
const Post = mongoose.model('posts');

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
            posts:posts,
            name: req.user.name
        });
    })
});

//Renders the upload page
router.get('/upload', ensureAuthenticated, (req, res)=>{
    res.render('posts/upload');
});

router.get('/image/:filename', ensureAuthenticated,(req, res)=>{
    console.log(gfs);
    console.log(req.params.filename);
    
    gfs.files.findOne({filename: req.params.filename}, (err, file)=>{
        console.log(file);
        if(!file || file.length === 0){
            return res.status(404).json({
                err: 'No Image exists'
            });
            //replace with readstream.pipe later for 404 image
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
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
        });
        }
    });
})

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
        console.log(req.file);
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
                postImage: req.file.filename
            }
            console.log(newPost);
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

//checks if the uploaded post is private or not
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