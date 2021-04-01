const express = require('express');
const router =express.Router();
const multer=require('multer');
const path = require('path');
const Country = require('../Modal/Location/CountryModel');
const State = require('../Modal/Location/StateModel');
 
                                                    ////////////COUNTRYIES//////////////
//GET ALL  LIST
router.get('/country/get',async (req,res)=>{
    try{
        const countryList= await Country.find();
        res.json({status:true,data:countryList});
       }
       catch(err){
        res.json({status:false,message:"Data not Found"});
       }
});

//GET ONE  BY ID
router.get('/country/:countryId',async (req,res)=>{
    console.log(req.params.countryId)
    try{
        const postDet=await Country.findById(req.params.countryId);
        res.json({status:true,data:postDet});
       }
       catch(err){
        res.json({message:err});
       }
});

router.post("/country/add", (req,res) => {
        const newCountry = new Country({
          sortname: req.body.sortname,
          name: req.body.name
        });
        newCountry
          .save()
          .then((data) => {
            res.json({
              status: true,
              message: "Data added successfully",
              data: newCountry,
            });
          })
          .catch((err) => {
            console.log(err);
            if (err.code === 11000) {
              res.json({
                status: false,
                message: "Validation error `name` should be unique",
              });
            } else {
              res.json({ status: false, message: "Data not added" });
            }
          });
});
//ADD 

//DELETE THE  BY ID
router.delete('/country/delete/:countryId',async (req,res)=>{
    console.log(req.params.countryId)
    try{
        const removePost = await Country.remove({
            _id:req.params.countryId
        });
        res.json(removePost);
       }
       catch(err){
        res.json({message:err});
       }
});



                                            //////////////STATES//////////  ////

//GET ALL  LIST
router.get('/state/get',async (req,res)=>{
    try{
        stateList= await State.find();
        res.json({status:true,data:stateList});
       }
       catch(err){
        res.json({status:false,message:"Data not Found"});
       }
});

//GET ONE  BY ID
router.get('/state/:stateId',async (req,res)=>{
    console.log(req.params.stateId)
    try{
        const postDet=await State.findById(req.params.stateId);
        res.json({status:true,data:postDet});
       }
       catch(err){
        res.json({message:err});
       }
});

router.post("/state/add", (req,res) => {
        const newstate = new State({
          sortname: req.body.sortname,
          name: req.body.name
        });
        newstate
          .save()
          .then((data) => {
            res.json({
              status: true,
              message: "Data added successfully",
              data: newstate,
            });
          })
          .catch((err) => {
            console.log(err);
            if (err.code === 11000) {
              res.json({
                status: false,
                message: "Validation error `name` should be unique",
              });
            } else {
              res.json({ status: false, message: "Data not added" });
            }
          });
});
//ADD 

//DELETE THE  BY ID
router.delete('/state/delete/:stateId',async (req,res)=>{
    console.log(req.params.stateId)
    try{
        const removePost = await State.remove({
            _id:req.params.stateId
        });
        res.json(removePost);
       }
       catch(err){
        res.json({message:err});
       }
});

module.exports = router;