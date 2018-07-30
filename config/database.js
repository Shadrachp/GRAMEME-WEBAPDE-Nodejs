if(process.env.NODE_ENV === 'production'){
   module.exports= {mongoURI: 'mongodb://Rachs:rax123@ds159631.mlab.com:59631/grameme'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/grameme-dev'}
}