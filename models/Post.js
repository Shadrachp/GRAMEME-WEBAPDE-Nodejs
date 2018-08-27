const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Grid = require('gridfs-stream');

const db = require('../config/database');
const conn = mongoose.createConnection(db.mongoURI);


let gfs;

conn.once('open', ()=>{
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});

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

const Post = mongoose.model("post", PostSchema);

const model = {

    fSearch: function (id, search){
        return new Promise((resolve, reject)=>{
            Post.find({
                user: id,
                index: {$regex: search, $options: "$i"}
            })
                .sort({date: 'desc'})
                .then(posts => {
                    resolve(posts);
                }, (err)=>{
                    reject(err);
                });
        });
    },

    getPosts: function (id){
        return new Promise((resolve, reject)=>{
            Post.find({user: id})
                .sort({date:'desc'})
                .then(posts =>{
                    resolve(posts);
                }, (err)=>{
                    reject(err);
                });
        });
    },

    pubPosts: function(){
        return new Promise((resolve)=>{
            Post.find({private: false})
                .sort({date:'desc'})
                .then(posts =>{
                    resolve(posts);
                });
        });

    },

    pSearch: function(search){
        return new Promise((resolve) => {
            Post.find({index: {$regex: search, $options: "$i"},
                private: false})
                .sort({date: 'desc'})
                .then(posts =>{
                    resolve(posts);
                });
        });

    },

    getEdit: function(id, user){
        return new Promise((resolve, reject)=>{
            Post.findOne({
                _id: id,
                user: user
            }).then(post =>{
                    resolve(post);
                }, (err)=>{
                    reject(err);
                });
        });

    },

    edit: function (id, user) {
        return new Promise((resolve, reject)=>{
            Post.findOne({
                _id: id,
                user: user
            }).then(post => {
                resolve(post);
            }, (err)=>{
                reject(err);
            });
        });

    },

    profile: function(id){
        return new Promise((resolve, reject)=>{
            Post.find({
                user: id,
                private: false
            })
                .sort({date: 'desc'})
                .then(posts => {
                    resolve(posts);
                }, (err)=>{
                    reject(err);
                });
        });
    },
    upload: function(newPost){
        return new Promise((resolve, reject)=>{
            new Post(newPost).save().then(post=>{
                resolve(post);
            }, (err)=>{
                reject(err);
            });
        });

    },
    searchTag: function(tag){
        return new Promise((resolve, reject)=>{
            Post.find({index: {$regex: tag, $options: "$i"}})
                .sort({date: 'desc'})
                .then(posts=>{
                    resolve(posts);
                }, (err)=>{
                    reject(err);
                });
        });

    },

    pDelete: function(id, user){
        return new Promise((resolve, reject)=>{
            Post.findOne({_id: id, user: user}).then((post)=>{
                resolve(post);
            }, (err)=>{
                reject(err);
            });
        });
    },
    pRemove: function(id){
        return new Promise((resolve, reject)=>{
            Post.remove({
                _id: id
            }).then(() => {
                resolve();
            }, (err)=>{
                reject(err);
            });
        });

    },

    gfsDel: function(id){
        return new Promise((resolve, reject)=>{
            gfs.remove({_id: id}).then(() => {
                resolve();
            }, (err)=>{
                reject(err);
            });
        });

    },

    getImg: function(filename){
        return new Promise((resolve, reject)=>{
            gfs.files.findOne({filename: filename}, (err, file)=>{
                if(file){
                    const readstream = gfs.createReadStream(file.filename);
                    resolve(readstream);
                }else{
                    err = 'No Image exists';
                    reject(err);
                }
            });
        });
    },

    findPost: function(postid){
        return new Promise((resolve, reject)=>{
            Post.findOne({_id: postid}).then(post=>{
                resolve(post);
            }, (err)=>{
                reject(err);
            })
        })
    },

    findShared: function(id){
        return new Promise((resolve, reject)=>{
            Post.find({shared: id})
                .sort({date: 'desc'})
                .then(posts=>{
                resolve(posts);
            }, (err)=>{
                reject(err);
            });
        })
    }
};



mongoose.model('posts', PostSchema);
module.exports = model;