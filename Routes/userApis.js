const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const City = require("../Modal/Location/CityModel");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Modal/UserModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

//GET ALL College LIST
router.get("/get", async (req, res) => {
  try {
    const userList = await User.find({ status: true })
      .select("firstName lastName email phoneNo status college createdAt")
      .populate("college");
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/get/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({ _id: req.params.userId, status: true })
      .select("firstName lastName email phoneNo status college createdAt")
      .populate("college");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/admin-get", async (req, res) => {
  try {
    const userList = await User.find()
      .select("firstName lastName email phoneNo status college createdAt")
      .populate("college");
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/admin-get/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({ _id: req.params.userId })
      .select("firstName lastName email phoneNo status college createdAt")
      .populate("college");
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
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ message: err });
  }
});

router.post(
  "/login",
  [
    check("email", "Please enter valid email").isEmail(),
    check("password", "Please enter a password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      if (user.status === true) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
        const payload = {
          user: {
            email: user.email,
          },
        };
        jwt.sign(
          payload,
          process.env.JWT,
          {
            expiresIn: 360000,
          },
          (err, token) => {
            if (token) {
              res.json({
                status: true,
                data: {
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phoneNo: user.phoneNo,
                  status: user.status,
                  rollNo: user.rollNo,
                  college: user.college,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                  token: token,
                },
              });
            } else {
              res.json({ status: false, message: "token not generated " });
            }
          }
        );
      } else {
        res.json({
          status: false,
          message: "user is blocked please contact other user",
        });
      }
    } catch (err) {
      res.json({ status: false, message: "Login failed" });
    }
  }
);

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
    check("firstName", "Name is required").not().isEmpty(),
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
    const {
      firstName,
      lasttName,
      rollNo,
      collegeId,
      status,
      email,
      password,
      phoneNo,
    } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ errors: { msg: "User already exists" } });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHased = await bcrypt.hash(password, salt);
      const newUser = new User({
        email: email,
        phoneNo: phoneNo,
        status: status,
        rollNo: rollNo,
        firstName: firstName,
        lastName:lastName,
        verified:false,
        college: collegeId,
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
              firstName:firstName,
              lastName:lastName,
              email: email,
              status: status,
              rollNo: rollNo,
              phoneNo: phoneNo,
              college: collegeId,
              token: token,
            },
          });
        }
      });
      //  req.send({status:true, 'An e-mail has been sent to ' + email + ' with further instructions.'})
    } catch (err) {
      console.log(req.body);
      res.json({ status: false, message: "User not added" });
    }
  }
);

//UPDATE THE College BY ID
router.patch("/:userId", async (req, res) => {
  console.log(req.params.userId);
  try {
    const userData = req.body;
    const changeuser = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
      },
      {
        $set: userData,
      },
      { upsert: true, returnNewDocument: true }
    );
    res.json({
      status: true,
    });
  } catch (err) {
    res.json({ message: err });
  }
});

//UPDATE THE College BY ID
router.patch("/chnagePassword", async (req, res) => {
  console.log(req.params.userId);
  try {
    const userData = req.body;
    const changeuser = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
      },
      {
        $set: userData,
      },
      { upsert: true, returnNewDocument: true }
    );
    res.json({
      status: true,
    });
  } catch (err) {
    res.json({ message: err });
  }
});

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

router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  try {
    const userDet = await User.find({ email: email });

    if (userDet) {
      var smtpTransport = await nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "singhnitesh9001@gmail.com",
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      });
      var ramdomNo = Math.floor(100000 + Math.random() * 900000);
      ramdomNo = String(ramdomNo);
      ramdomNo = ramdomNo.substring(0, 4);
      console.log(ramdomNo, userDet[0]._id);
      var mailOptions = {
        to: email,
        from: "singhnitesh9001@gmail.com",
        subject: "Verify Account",
        html: "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>"+ ramdomNo + "</h1></div>"

      };
      let info = await smtpTransport.sendMail(mailOptions, function (err) {
        console.log("err", err,userDet);
        if (!err) {
         
          res.json({ status: true, message: "Email Send to mail" });

        } else {
          res.json({ status: false, message: "Email not Send to mail" });
        }
        
      });
      const userData = {
        verifyToken: ramdomNo,
      };
      const changeuser = await User.findByIdAndUpdate(
        {
          _id: userDet[0]._id,
        },
        {
          $set: {
            verifyToken: ramdomNo
          },
        },
        { upsert: true}
      );
    }
  } catch (err) {
    res.json({ message: err });
  }
});


router.post('/verify',async (req,res)=>{
  const { email,tokenValue } = req.body;
  try {
    const userDet = await User.find({ email: email });
    if(userDet[0].verifyToken==tokenValue){
      const changeuser = await User.findByIdAndUpdate(
        {
          _id: userDet[0]._id,
        },
        {
          $set: {
            verified: true
          },
        },
        { upsert: true}
      );
    res.json({status:true, message:"verified" });

    }
  }
  catch(err){
    res.json({status:false, message:"Not verified" });
  }
})


router.post('/forgetPassword',async (req,res)=>{
    try{
   const tokenValue = await crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        console.log(token,err)
        User.findOne({ email: req.body.email }, function(err, user) {
              if (!user) {       
                console.log('wrong')
                return  res.status(400).json({'errors':'No user found'});
              }
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now(); // 1 hour  
              user.save(function(err) {
          res.json({status:true, data: 'reset Password is set Sucessfully' });
               
              });
            });
      });
      console.log(tokenValue)
   
  }
  catch(err){
    res.json({status:false, message: err });
  }
})


router.post('/reset' , async (req,res)=>{
   
   await User.findOne({ resetPasswordToken :req.body.resetPasswordToken }).then(user => {    
      if (user.resetPasswordToken===null) {
        console.error('password reset link is invalid or has expired');
        res.status(403).json({status:true,data:'password reset link is invalid or has expired'});
      } else if (user != null) {
        console.log('user exists in db');
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
            user
            .updateOne({
            password:hash,
            resetPasswordToken:null,
            resetPasswordExpires:null
            })
          .then(() => {
            console.log(`password updated ${user.password}`);
            res.status(200).json({status:true, message: 'password updated' });
          });
        });
      });
      } 
      else {
        console.error('no user exists in db to update');
        res.status(401).json({status:false,data:'no user exists in db to update'});
      }
  
  })
})


module.exports = router;
