const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const Admin = require("../Modal/AdminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult } = require("express-validator");
var dotenv = require("dotenv");
require("dotenv").config();

//GET ALL College LIST
router.get("/get", async (req, res) => {
  try {
    const adminList = await Admin.find();
    res.json({ status: true, data: adminList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/get/:adminId", async (req, res) => {
  console.log(req.params.adminId);
  try {
    const adminDet = await Admin.findById(req.params.adminId);
    res.json({ status: true, data: {
      _id:admin._id ,
      name: admin.name,
      email: admin.email,
      admin: true,
      phoneNo: admin.phoneNo,
      title: admin.title,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      }
    });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET College BY SEARCH
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
    let admin = await Admin.findOne({ email: email });
    console.log(admin)
    if(!admin) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
  }
  if(admin.status===true){
    const isMatch = await bcrypt.compare(password, admin.password );
  if(!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
  }
  const payload = {
      user: {
        email: admin.email,
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
                      _id:admin._id ,
                      name: admin.name,
                      email: admin.email,
                      admin: true,
                      status:status,
                      phoneNo: admin.phoneNo,
                      title: admin.title,
                      createdAt: admin.createdAt,
                      updatedAt: admin.updatedAt,
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
    res.json({ status: false, message: "Admin is blocked please contact other admin" });

  }

  } catch (err) {
    res.json({ status: false, message: "Login failed" });
  }
});

//ADD COLLEGE
router.post(
  "/add",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
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
    const { name, email, password, phoneNo, title , status } = req.body;
    try {
      let admin = await Admin.findOne({ email: email });
      if (admin) {
        return res.status(400).json({ errors: { msg: "User already exists" } });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHased = await bcrypt.hash(password, salt);
      const newAdmin = await new Admin({
        name: name,
        email: email,
        admin:true,
        status:status,
        phoneNo: phoneNo,
        password: passwordHased,
        title: title,
      });
      newAdmin.save();
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
              admin: true,
              email: email,
        status:status,
              phoneNo: phoneNo,
              title: title,
              token: token,
            },
          });
        }
      });
    } catch (err) {
      console.log(req.body);
      res.json({ status: false, message: "Admin not added" });
    }
  }
);

//UPDATE THE College BY ID
router.put("/update/:adminId", async (req, res) => {
  console.log(req.params.adminId);
  try {
    const udpateData=req.body
    const changeAdmin = await Admin.findOneAndUpdate({
      _id: req.params.adminId},{
        $set: 
        udpateData
      },
      {upsert:true}
      );
    res.json({status:true,data:{
      _id:changeAdmin._id,
      name: changeAdmin.name,
      email: changeAdmin.email,
      admin: changeAdmin.admin,
      status:changeAdmin.status,
      phoneNo: changeAdmin.phoneNo,
      title: changeAdmin.title,
      createdAt: changeAdmin.createdAt,
      updatedAt: changeAdmin.updatedAt,
    }
  });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
