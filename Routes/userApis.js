const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Modal/UserModel");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const crypto = require("crypto");
const auth = require("../Middleware/auth");
const adminAuth = require("../Middleware/adminAuth");
const UserModel = require("../Modal/UserModel");

//GET ALL LIST
router.get("/get", auth, async (req, res) => {
  try {
    const userList = await User.find({ status: true })
      .select(
        "firstName lastName email  MediaUrl phoneNo status college createdAt"
      )
      .populate("college");
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE BY ID
router.get("/get/:userId", auth, async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({ _id: req.params.userId, status: true })
      .select(
        "firstName lastName email  MediaUrl phoneNo status college createdAt"
      )
      .populate("college");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    console.log(req.user.user);
    const postDet = await User.find({ _id: req.user.user.id, status: true })
      .select(
        "firstName lastName email  MediaUrl phoneNo status college createdAt"
      )
      .populate("college");
    console.log(postDet);
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.get("/admin-get", adminAuth, async (req, res) => {
  try {
    const userList = await User.find()
      .select(
        "firstName lastName email MediaUrl phoneNo status college createdAt"
      )
      .populate("college");
    res.json({ status: true, data: userList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE BY ID
router.get("/admin-get/:userId", adminAuth, async (req, res) => {
  console.log(req.params.userId);
  try {
    const postDet = await User.find({ _id: req.params.userId })
      .select(
        "firstName lastName email MediaUrl phoneNo status college createdAt"
      )
      .populate("college");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET BY SEARCH
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
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      if (!user)
        return res
          .status(400)
          .json({ status: fasle, message: "Invalid Credentials" });

      if (user.verified !== true)
        return res.status(400).json({
          status: false,
          message: "Verify Your Account Credentials",
        });
      if (user.status === true) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res
            .status(400)
            .json({ status: false, message: "Invalid Credentials" });

        const payload = {
          user: {
            email: user.email,
            id: user._id,
            alumni: false,
          },
        };
        jwt.sign(
          payload,
          process.env.JWT,
          {
            expiresIn: 360000,
          },
          (err, token) => {
            if (token)
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
            else res.json({ status: false, message: "token not generated " });
          }
        );
      } else
        res.json({
          status: false,
          message: "user is blocked please contact other user",
        });
    } catch (err) {
      res.json({ status: false, message: "Login failed" });
    }
  }
);

//ADD User
router.post(
  "/register",
  [
    check("firstName", "Name is required").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      firstName,
      lastName,
      rollNo,
      collegeId,
      status,
      email,
      password,
      phoneNo,
    } = req.body;
    if (!firstName || !rollNo || !collegeId || !phoneNo || !password || !email)
      return res.status(400).json({
        status: false,
        message: "firstName , rollNo collegeId phoneNo should not be empty",
      });

    try {
      const user = await User.findOne({ email: email });
      if (user && user.verified !== true) {
        return res.status(400).json({
          status: false,
          message: "Verify Your Account Credentials",
        });
      } else {
        console.log(req.body);

        const salt = await bcrypt.genSalt(10);
        const passwordHased = await bcrypt.hash(password, salt);

        var ramdomNo = Math.floor(100000 + Math.random() * 900000);
        ramdomNo = String(ramdomNo);
        ramdomNo = ramdomNo.substring(0, 4);
        const newUser = new User({
          email: email,
          phoneNo: phoneNo,
          status: true,
          rollNo: rollNo,
          firstName: firstName,
          lastName: lastName,
          MediaUrl: null,
          verified: false,
          events: [],
          friendCount: 0,
          friendList: [],
          admin: false,
          totalFriend: 0,
          eventscount: 0,
          college: collegeId,
          password: passwordHased,
          verifyToken: ramdomNo,
        });

        await newUser.save();
        const oAuth2Client = new google.auth.OAuth2(
          process.env.CLIENTID,
          process.env.CLINETSECERT,
          process.env.REDIRECTURI
        );
        oAuth2Client.setCredentials({
          refresh_token: process.env.CLIENTREFRESHTOKEN,
        });

        console.log(
          process.env.CLIENTID,
          process.env.CLINETSECERT,
          process.env.REDIRECTURI
        );
        const accessToken = await oAuth2Client.getAccessToken();
        var smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "your mail",
            clientId: process.env.CLIENTID,
            clientSecret: process.env.CLINETSECERT,
            refreshToken: process.env.CLIENTREFRESHTOKEN,
            accessToken: accessToken,
          },
        });

        var mailOptions = {
          to: email,
          from: "dsddss",
          subject: "Verify Account",
          html:
            "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
            ramdomNo +
            "</h1></div>",
        };
        smtpTransport.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            return res.json({
              status: false,
              message: "Email not Send to mail",
            });
          } else {
            return res.json({
              status: true,
              message: "Email Send to mail",
            });
          }

          // const userOne = User.findOne({ email: email });

          // if (!userOne)
          //   return res.json({
          //     status: false,
          //     errors: "User is not regsitered",
          //   });

          // const payload = {
          //   user: {
          //     email: email,
          //     id: userOne._id,
          //     alumni: false,
          //   },
          // };

          // jwt.sign(payload, process.env.JWT, function (err, token) {
          //   console.log(err, token);
          //   if (token) {
          //     res.json({
          //       status: true,
          //       data: {
          //         firstName: firstName,
          //         lastName: lastName,
          //         email: email,
          //         status: status,
          //         rollNo: rollNo,
          //         phoneNo: phoneNo,
          //         admin: false,
          //         college: collegeId,
          //         token: token,
          //       },
          //     });
          // }
          // });
        });
      }
    } catch (err) {
      res.json({ status: false, message: "User not added", errors: err });
    }
  }
);

//UPDATE THE BY ID
router.patch("/:userId", auth, async (req, res) => {
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

//UPDATE THE BY ID
router.patch("/updatePassword/:userId", auth, async (req, res) => {
  const { password } = req.body;
  try {
    if (password.length < 5) {
      res.json({
        status: false,
        message:
          "id and password and password must be greater then 6 data required",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHased = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(
        {
          _id: req.params.alumniId,
        },
        {
          $set: {
            password: passwordHased,
          },
        },
        { upsert: true, returnNewDocument: true }
      );
      res.json({
        status: true,
      });
    }
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.patch("/media/:userId", auth, async (req, res) => {
  console.log(req.params.userId);
  try {
    const { MediaUrl } = req.body;
    const changeUser = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
      },
      {
        $set: {
          MediaUrl: MediaUrl,
        },
      },
      { upsert: true, returnNewDocument: true }
    );
    res.json({
      status: true,
    });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

//DELETE THE  BY ID
router.delete("/delete/:userId", auth, async (req, res) => {
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
  try {
    const { email } = req.body;
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENTID,
      process.env.CLINETSECERT,
      process.env.REDIRECTURI
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.CLIENTREFRESHTOKEN,
    });

    console.log(
      process.env.CLIENTID,
      process.env.CLINETSECERT,
      process.env.REDIRECTURI
    );
    const accessToken = await oAuth2Client.getAccessToken();
    const userDet = await User.find({ email: email });

    if (userDet) {
      var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "",
          clientId: process.env.CLIENTID,
          clientSecret: process.env.CLINETSECERT,
          refreshToken: process.env.CLIENTREFRESHTOKEN,
          accessToken: accessToken,
        },
      });
      console.log("hello");
      var ramdomNo = Math.floor(100000 + Math.random() * 900000);
      ramdomNo = String(ramdomNo);
      ramdomNo = ramdomNo.substring(0, 4);

      await User.findByIdAndUpdate(
        {
          _id: userDet[0]._id,
        },
        {
          $set: {
            verifyToken: ramdomNo,
          },
        },
        { upsert: true }
      );
      console.log(ramdomNo, userDet[0]._id);

      var mailOptions = {
        to: email,
        from: "",
        subject: "Verify Account",
        html:
          "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
          ramdomNo +
          "</h1></div>",
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log("err", err, userDet);
        if (!err) {
          res.json({ status: true, data: "Email Send to mail" });
        } else {
          res.json({ status: false, message: "Email not Send to mail" });
        }
      });
    }
  } catch (err) {
    res.json({ status: false, message: "Error occured", error: err });
  }
});

router.post("/verify", async (req, res) => {
  const { email, tokenValue } = req.body;
  try {
    const userDet = await User.find({ email: email });
    if (userDet[0].verifyToken == tokenValue) {
      const changeuser = await User.findByIdAndUpdate(
        {
          _id: userDet[0]._id,
        },
        {
          $set: {
            verified: true,
          },
        },
        { upsert: true }
      );
      res.json({ status: true, data: "Verified" });
    }
  } catch (err) {
    res.json({ status: false, message: "Not verified" });
  }
});

router.post("/forgetPassword", async (req, res) => {
  try {
    var oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENTID,
      process.env.CLINETSECERT,
      process.env.REDIRECTURI
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.CLIENTREFRESHTOKEN,
    });
    var accessToken = await oAuth2Client.getAccessToken();

    crypto.randomBytes(20, function (err, buf) {
      var token = buf.toString("hex");

      User.findOne({ email: req.body.email }).then((response) => {
        if (!response)
          return res.json({ status: false, message: "No user found" });
        if (!response.status)
          return res.json({ status: false, message: "User is blocked " });

        var smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "",
            clientId: process.env.CLIENTID,
            clientSecret: process.env.CLINETSECERT,
            refreshToken: process.env.CLIENTREFRESHTOKEN,
            accessToken: accessToken,
          },
        });

        var ramdomNo = Math.floor(100000 + Math.random() * 900000);
        ramdomNo = String(ramdomNo);
        ramdomNo = ramdomNo.substring(0, 4);

        var mailOptions = {
          to: req.body.email,
          from: "",
          subject: "Verify Account",
          html:
            "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
            ramdomNo +
            "</h1></div>",
        };

        smtpTransport.sendMail(mailOptions, function (err) {
          if (!err) {
            res.json({ status: true, data: "Email Send to mail" });
          } else {
            res.json({ status: false, message: "Email not Send to mail" });
          }
        });
        response.verifyToken = ramdomNo;
        response.resetPasswordToken = token;
        response.resetPasswordExpires = Date.now(); // 1 hour
        response.save().then((ress) => {
          console.log(ress);
          return res.json({
            status: true,
            message: "Otp send sucessfully",
          });
        });
      });
    });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.resetPasswordToken,
    });
    if (!user)
      return res.json({
        status: false,
        message: "No user is found ",
      });
    if (!user.resetPasswordToken)
      return res.json({
        status: false,
        message: "password reset link is invalid or has expired",
      });
    if (req.body.otpEmail !== user.verifyToken)
      return res.json({
        status: false,
        message: "otp is invalid or has expired",
      });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        user.password = hash;
        user.save();
        user
          .updateOne({
            password: hash,
            resetPasswordToken: null,
            verifyToken: null,
            resetPasswordExpires: null,
          })
          .then(() => {
            res.json({ status: true, data: "password updated" });
          });
      });
    });
  } catch (err) {
    res.json({ status: false, message: "Some internal Issue" });
  }
});

module.exports = router;
