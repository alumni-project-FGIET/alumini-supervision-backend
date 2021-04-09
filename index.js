var express = require('express');
var app = express();
var http = require('http');
var dotenv = require('dotenv');
var bodyParser=require('body-parser');
const path = require('path');
const cors=require('cors');
const connection=require('./Config');
const college=require('./Routes/collegeApis')
const country = require('./Routes/loactionApis')
const user = require('./Routes/userApis')
const admin=require('./Routes/adminApis')
require('dotenv').config()

const port = process.env.PORT || 5000 ;
const server = http.createServer(app);

app.get('/',(req,res)=>{
    res.send('Alumni Supervision')
})
app.use(cors());
// app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname,'./uploads/')));
app.use('/college',college)
app.use('/location',country)
app.use('/user',user)
app.use('/admin',admin)

server.listen(port,function(){
    console.log('listen to server .....',port);
});

