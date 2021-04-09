const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const City =require('../Modal/Location/CityModel');
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Modal/UserModel");


//GET ALL College LIST
router.get("/get", async (req, res) => {
  try {
    const userList = await User.find({ status:true}).select(
      "name email phoneNo status college createdAt").populate('college');
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/get/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({_id:req.params.userId,status:true}).select(
      "name email phoneNo status college createdAt").populate('college');
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/admin-get", async (req, res) => {
  try {
    const userList = await User.find().select(
      "name email phoneNo status college createdAt").populate('college');
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/admin-get/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({_id:req.params.userId}).select("name email phoneNo status college createdAt").populate('college');
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET College BY SEARCH
router.post("/search", async (req, res) => {
  try {
    var regex = new RegExp(req.body.name, "i");
    const userList = await User.find({ name: regex });
    res.json({status:true, data:userList});
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/login", [
  check("email", "Please enter valid email").isEmail(),
  check(
    "password",
    "Please enter a password").exists(),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password} = req.body;
  try {
    let user = await User.findOne({ email: email });
    if(!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
  }
  if(user.status===true){
    const isMatch = await bcrypt.compare(password, user.password );
  if(!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
  }
  const payload = {
      user: {
        email: user.email,
      }
  }
  jwt.sign(payload, process.env.JWT,
      {
          expiresIn: 360000
      },
      (err, token) => {
          if(token) {
            res.json({
                    status: true,
                    data: {
                      _id:user._id ,
                      name: user.name,
                      email: user.email,
                      phoneNo:user.phoneNo,
                      status:user.status,
                      rollNo:user.rollNo,
                      college:user.college,
                      createdAt: user.createdAt,
                      updatedAt: user.updatedAt,
                      token: token,
                    },
            });
          }
          else{
       res.json({ status: false, message: "token not generated " });
          }
  });
}
  else{
    res.json({ status: false, message: "user is blocked please contact other user" });

  }

  } catch (err) {
    res.json({ status: false, message: "Login failed" });
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

//ADD User
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check("collegeId", "Please Select valid College").exists(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, rollNo,collegeId,status,email, password, phoneNo } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ errors: { msg: "User already exists" } });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHased = await bcrypt.hash(password, salt);
      const newUser = await new User({
        name: name,
        email: email,
        phoneNo:phoneNo,
        status:status,
        rollNo:rollNo,
        college:collegeId,
        password: passwordHased,
      });
      newUser.save();
      const payload = {
        user: {
          email: email,
        },
      };
      
      jwt.sign(payload, process.env.JWT, function (err, token) {
        console.log(err, token);
        if (token) {
          res.json({
            status: true,
            data: {
              name: name,
              email: email,
              status:status,
              rollNo:rollNo,
              phoneNo: phoneNo,
              college:collegeId,
              token: token,
            },
          });
        }
      });
    } catch (err) {
      console.log(req.body);
      res.json({ status: false, message: "User not added" });
    }
  }
);

//DELETE THE College BY ID
router.delete("/delete/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const removePost = await User.remove({
      _id: req.params.userId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;