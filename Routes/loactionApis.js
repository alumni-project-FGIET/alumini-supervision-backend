const express = require('express');
const router =express.Router();
const multer=require('multer');
const path = require('path');
const Country = require('../Modal/Location/CountryModel');
const State = require('../Modal/Location/StateModel');
const City = require('../Modal/Location/CityModel');
 

////////////COUNTRYIES//////////////

//GET ALL  LIST
router.get('/country/get',async (req,res)=>{
    try{
        const countryList= await Country.find();
        res.status(200).json({status:true,data:countryList});
       }
       catch(err){
        res.status(400).json({status:false,message:"Data not Found"});
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

router.patch("/update/:countryId", async (req, res) => {
  console.log(req.params.countryId);
  try {
    const udpateData = req.body
    const changeCountry = await Country.findOneAndUpdate({
      _id: req.params.countryId},{
          $set: 
          udpateData
      },
      {upsert:true}
      );
    res.json({status:true,data:changeCountry});
  } catch (err) {
    res.json({ message: err });
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

router.post('/state/add', async (req,res) => {
    try{
     if(req.body.countryId){
      const country = await Country.findById(req.body.countryId)
      console.log(country)
      const newstate = new State({
          sortname: req.body.sortname,
          name: req.body.name,
          country:country,
          countryId:req.body.countryId
        });

        await newstate
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
        }
        else{
          res.json({ status: false, message: "StateId should not be null" });
        }
    }
    catch(err){
      console.log(req.body)
      res.send({err:'error'})
    }
      
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

router.patch("/update/:stateId", async (req, res) => {
  console.log(req.params.stateId);
  try {
    const udpateData = req.body
    const changeState = await State.findOneAndUpdate({
      _id: req.params.stateId},{
          $set: 
          udpateData
      },
      {upsert:true}
      );
    res.json({status:true,data:changeState});
  } catch (err) {
    res.json({ message: err });
  }
});








//////////////CITY//////////  ////

//GET ALL  LIST
router.get('/city/get',async (req,res)=>{
  try{
      cityList= await City.find();
      res.json({status:true,data:cityList});
     }
     catch(err){
      res.json({status:false,message:"Data not Found"});
     }
});


router.get('/city/:cityId',async (req,res)=>{
  console.log(req.params.cityId)
  try{
      const postDet=await City.findById(req.params.cityId);
      res.json({status:true,data:postDet});
     }
     catch(err){
      res.json({message:err});
     }
});

router.post('/city/add', async (req,res) => {
  try{
    if(req.body.stateId){
      const state = await State.findById(req.body.stateId)
      console.log(state)
      const newCity = new City({
          name: req.body.name,
          state:state,
          stateId:req.body.stateId
        });
  
        await newCity
          .save()
          .then((data) => {
            res.json({
              status: true,
              message: "Data added successfully",
              data: newCity,
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
    }
    else{
      res.json({ status: false, message: "StateId should not be null" });
    }
    
  }
  catch(err){
    console.log(req.body)
    res.send({err:'error'})
  }
    
});
//ADD 

//DELETE THE  BY ID
router.delete('/city/delete/:cityId',async (req,res)=>{
  console.log(req.params.cityId)
  try{
      const removePost = await City.remove({
          _id:req.params.cityId
      });
      res.json(removePost);
     }
     catch(err){
      res.json({message:err});
     }
});

router.patch("/update/:cityId", async (req, res) => {
  console.log(req.params.cityId);
  try {
    const udpateData = req.body
    const changeCity = await City.findOneAndUpdate({
      _id: req.params.cityId},{
          $set: 
          udpateData
      },
      {upsert:true}
      );
    res.json({status:true,data:changeCity});
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;