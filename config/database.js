if(process.env.NODE_ENV === 'production'){
   module.exports= {mongoURI: 'mongodb://Rachs:rax123@ds147391.mlab.com:47391/videa-prod'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/grameme-dev'}
}