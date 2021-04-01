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
require('dotenv').config()

const port = process.env.PORT ;
const server = http.createServer(app);
app.use(cors());
// app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname,'./uploads/')));
app.use('/college',college)
app.use('/location',country)

server.listen(port,function(){
    console.log('listen to server .....',port);
});

