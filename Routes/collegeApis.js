const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const City = require("../Modal/Location/CityModel");
const adminAuth = require("../Middleware/adminAuth");
const auth = require("../Middleware/auth");
//GET ALL College LIST

router.get("/get", async (req, res) => {
  try {
    const collegeList = await College.find({ status: true })
      .select("name status collegeCode city createdAt updatedAt")
      .populate("city", "name state");
    res.json({ status: true, data: collegeList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/get-admin", adminAuth, async (req, res) => {
  try {
    const collegeList = await College.find()
      .select("name status collegeCode city createdAt updatedAt")
      .populate("city", "name state");
    res.json({ status: true, data: collegeList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});
//GET ONE College BY ID
router.get("/get/:collegeId", async (req, res) => {
  console.log(req.params.collegeId);
  try {
    const postDet = await College.findOne({
      _id: req.params.collegeId,
      status: true,
    })
      .select("name status collegeCode city createdAt updatedAt")
      .populate("city", "name state");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});
router.get("/get-admin/:collegeId", async (req, res) => {
  console.log(req.params.collegeId);
  try {
    const postDet = await College.findById(req.params.collegeId)
      .select("name status collegeCode city createdAt updatedAt")
      .populate("city", "name state");
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

//ADD COLLEGE
router.post("/add", adminAuth, async (req, res) => {
  try {
    if (req.body.cityId) {
      const newCollege = await new College({
        name: req.body.name,
        collegeCode: req.body.collegeCode,
        city: req.body.cityId,
        status: req.body.status,
      });
      newCollege
        .save()
        .then((data) => {
          res.json({
            status: true,
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
            res.json({ status: false, message: "Data not added", error: err });
          }
        });
    } else {
      res.json({ status: false, message: "cityId should not be null" });
    }
  } catch (err) {
    console.log(req.body);
    res.json({ status: false, message: "College not added " });
  }
});

//DELETE THE College BY ID
router.delete("/:collegeId", adminAuth, async (req, res) => {
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

router.patch("/:collegeId", adminAuth, async (req, res) => {
  console.log(req.params.collegeId);
  try {
    const udpateData = req.body;
    const changeCollege = await College.findOneAndUpdate(
      {
        _id: req.params.collegeId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changeCollege });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
