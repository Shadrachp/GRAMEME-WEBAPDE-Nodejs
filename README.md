# GRAMEME-WEBAPDE 
## Link: grameme.tk

# WEBAPDE-MP2 Site Map
- This is a meme site entitled GraMeme. This is a Webapp for viewing and uploading memes. 
- MVC is already applied as an architectural pattern

1. index.handlebars - this is the landing page of all users and non-users of the website.

2. register.handlebars - this is the registration page of the webapp

3. posts/index.handlebars - profile page

4. posts/upload - the page to upload your memes

5. posts/edit - the page to edit your memes

# Dependencies
- bcryptjs
- body-parser
- connect-flash
- cookie-parser
- crypto
- express
- express-session
- express-handlebars
- gridfs-stream
- method-override
- mongoose
- multer
- multer-gridfs-storage
- passport
- passport-local
- sqreen
- nodemon (optional: for development purposes. use -global/-dev)

# Features
- Local database (NoSql)
- Login
- Register
- Proper auth.
- Cookie
- Upload memes
- Accounted for injection attacks with sqreen incl server side scripting check
- View memes
- Edit memes
- Delete memes
- mLab cloud db used for heroku deployment
- heroku deployment https://secure-forest-11470.herokuapp.com
# Upcoming features
- Add tags
- Search by tags (Clickable tags)
- Edit tags
- Search memes
- Share memes
