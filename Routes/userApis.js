const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const City =require('../Modal/Location/CityModel');
//GET ALL College LIST
router.get("/get", async (req, res) => {
  try {
    const collegeList = await College.find();
    res.json({ status: true, data: collegeList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/get/:collegeId", async (req, res) => {
  console.log(req.params.collegeId);
  try {
    const postDet = await College.findById(req.params.collegeId);
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET College BY SEARCH
router.post("/search", async (req, res) => {
  try {
    var regex = new RegExp(req.body.title, "i");
    const postDet = await College.find({ title: regex });
    res.json(postDet);
  } catch (err) {
    res.json({ message: err });
  }
});

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, "files-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
}).single("file");

//ADD COLLEGE
router.post("/add", async (req, res) => {
  try{
    if(req.body.cityId){
   const city = await City.findById(req.body.cityId)
    const newCollege = await new College({
      name: req.body.name,
      collegeCode:req.body.code,
      cityId: req.body.cityId,
      city:city,
      status: req.body.status,
    });
    newCollege
      .save()
      .then((data) => {
        res.json({
          status: true,
          message: "Data added successfully",
          data: newCollege,
        });
      })
      .catch((err) => {
        console.log(err.code);
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
      res.json({ status: false, message: "cityId should not be null" });
    }
  }
  catch(err){
      console.log(req.body)
      res.json({ status: false, message: "College not added " });

    }
});

//DELETE THE College BY ID
router.delete("/delete/:collegeId", async (req, res) => {
  console.log(req.params.collegeId);
  try {
    const removePost = await College.remove({
      _id: req.params.collegeId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
