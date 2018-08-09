require('sqreen');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const app = express();

//Load routes
const posts = require('./routes/posts');
const users = require('./routes/users');

//Load model
const Post = mongoose.model('posts');

//passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/database');

//Map global promise - remove warning
mongoose.Promise = global.Promise;

//Connect to mongoose
mongoose.connect(db.mongoURI)
 .then(()=>console.log('MongoDB Connected...'))
 .catch(err => console.log(err));

//Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.use(express.static(path.join(__dirname, '/public')));

//method-override middleware
app.use(methodOverride('_method'));

//Express session middleware
app.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true,
    cookie: {
//        secure: true,
        maxAge:  24 * 60 * 60 * 1000 //sets cookie for 1 day
    }
}));

app.use(cookieParser());

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global Variables
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals._msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Index Route
app.get('/', (req, res)=>{
    const title = 'Kamusta';
    Post.find({private: false})
    .sort({date:'desc'})
    .then(posts =>{
        res.render('index', {
            title, posts, 
            user: req.user
        });
    })
});

//About Route
app.get('/about', (req,res)=>{
    res.render('about');
});

app.post('/search', (req, res)=>{
    const search = req.body.search.trim();
    const title = "Kamusta"; //ignore
    if(search.length >0 )
        searchDB(req, res, search, title);
    else{
        const error = 'Search field is empty';
        req.flash('error_msg', error);
        res.redirect('/posts');
    }
});

//refactor search code later, add an attribute called index for Post Model
function searchDB(req, res, search, title){
    //A Ver Long query without adding the index attribute
    // let rPosts = [];
    //
    // Post.find({ title: {$regex: search, $options: "$i"}})
    //     .sort({date: 'desc'}).then(posts =>{
    //     rPosts = insertContent(rPosts, posts);
    //     Post.find({ name: {$regex: search, $options: "$i"}})
    //         .sort({date: 'desc'}).then(posts => {
    //         rPosts = insertContent(rPosts, posts);
    //         Post.find({ details: {$regex: search, $options: "$i"}})
    //             .sort({date: 'desc'}).then(posts => {
    //             rPosts = insertContent(rPosts, posts);
    //             if(rPosts.length > 0)
    //                 res.render('index', {title, posts: rPosts, search, user: req.user});
    //             else{
    //                 res.render('index', {title, user: req.user});
    //             }
    //         })
    //     })
    // });

    //shorter version of the query above, but it requires to add another attribute to the Post model
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
               res.render('index', {title, user: req.user, error,
               NoResult: true});
           }
       });
}

//prevents the insertion of duplicate content
// function insertContent(rPosts, posts) {
//     for (let i = 0; i < posts.length; i++)
//         if (!prevDuplicate(rPosts, posts))
//             rPosts.push(posts[i]);
//     return rPosts;
// }

//checks if b is already in a
// function prevDuplicate(rPosts, b){
//     let boo = false;
//     for (let i = 0; i < rPosts.length && !boo; i++)
//         boo = isIn(rPosts[i], b);
//     return boo;
// }

//part of prevDuplicate(param1, param2)
// function isIn(a, b){
//     return a.id == b.id;
// }

//User routes
app.use('/posts', posts);
app.use('/users', users);
//for heroku add p.e.PORT
const port = process.env.PORT || 3000;

app.get('/*', function(req, res) {
    res.redirect('/');
});

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});