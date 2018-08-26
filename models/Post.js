const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const PostSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    details:{
        type: String,
        required: true
    }, 
    user:{ //id of user who posted it
        type: String,
        required: true
    },
    name:{
        type: String,//name of user
        required: true 
    }
    ,
    postImage:{
        type: String,
        required: true //temporarily false
    },
    tags:{
      type: Array,
      default: []
    },
    private: {
        type: Boolean,
        required: true
    },
    shared:{
        type:Array,
        default:[] //array of user id
    },
    index:{
        type: String,
        required: true
    },
    date:{
        type: Date,  
        default: Date.now
    }
});

const controls = {

    fSearch: function (Post, req, res, profile){
    Post.find({
        user: req.user.id,
        index: {$regex: search, $options: "$i"}
    })
        .sort({date: 'desc'})
        .then(posts => {
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
    },

    getPosts: function (Post, req, res){
        Post.find({user: req.user.id})
            .sort({date:'desc'})
            .then(posts =>{
                res.render('posts/index', {
                    posts:posts, profile: true,
                    name: req.user.name,
                    description: req.user.description
                });
            })
    },

    pubPosts: function(Post, req, res){
        const title = 'Kamusta';
        Post.find({private: false})
            .sort({date:'desc'})
            .then(posts =>{
                res.render('index', {
                    title, posts,
                    user: req.user
                });
            })
    },

    pSearch: function(Post, req, res, search, title){
        Post.find({index: {$regex: search, $options: "$i"},
            private: false})
            .sort({date: 'desc'})
            .then(posts =>{
                if(posts.length > 0){
                    let result = ' result';
                    if(posts.length > 1)
                        result = result +'s';
                    const msg = posts.length + result + " found for '" + search + "'";
                    res.render('index', {title, posts, search, user: req.user, success_msg: msg});
                }
                else{
                    const error = "No results found for '" + search + "'";
                    res.render('index', {title, user: req.user, error});
                }
            });
    },

    getEdit: function(Post, req, res){
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
    },

    edit: function (Post, req, res) {
        Post.findOne({
            _id: req.params.id,
            user: req.user.id
        }).then(post => {
            if(post){
                post.title = req.body.title;
                post.details = req.body.details;
                post.tags = req.body.tags.split(",");
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
    },

    profile: function(User, Post, req, res){
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
                        let NoResult = false;
                        if (posts.length > 0)
                            NoResult = true;
                        res.render('posts/index', {
                            posts,
                            name: user.name,
                            description: user.description,
                            profile: true,
                            NoResult,
                        });
                    });
            }
        });
    },
    upload: function(Post, req, res){
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
        new Post(newPost).save().then(post=>{
            req.flash('success_msg', 'Successfully added ' +
                post.title + '!');
            res.redirect('/posts');
        })
    },
    searchTag: function(Post, req, res){
        const tag = req.params.tag;
        let profile = true;
        Post.find({index: {$regex: tag, $options: "$i"}})
            .sort({date: 'desc'})
            .then(posts=>{
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
    },
    pDelete: function(Post, gfs, req, res){
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
    },
    getImg: function(gfs, req, res){
        gfs.files.findOne({filename: req.params.filename}, (err, file)=>{
            if(!file || file.length === 0){
                return res.status(404).json({
                    err: 'No Image exists'
                });
            }
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        });
    }
};

function isPrivate(a){
//    console.log(a);
    return a === '1';
}

mongoose.model('posts', PostSchema);
module.exports = controls;