var mongoose=require('mongoose');
var dotenv = require('dotenv');
require('dotenv').config()


const connection =mongoose.connect(process.env.DBURL,{useNewUrlParser: true,useUnifiedTopology: true },()=>{
    console.log('Connected DB Successfully !!!...')
});

module.exports = connection