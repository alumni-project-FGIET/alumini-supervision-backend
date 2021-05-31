const express = require("express");
const router = express.Router();
const College = require("../Modal/collegeModels");
const multer = require("multer");
const path = require("path");
const City = require("../Modal/Location/CityModel");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Alumni = require("../Modal/AlumniModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const auth = require("../Middleware/auth");
const adminAuth = require("../Middleware/adminAuth");
const alumniAuth = require("../Middleware/alumniAuth");

//GET ALL College LIST
router.get("/get", auth, async (req, res) => {
  try {
    const alumniList = await Alumni.find({ status: true })
      .select(
        "firstName lastName email phoneNo posts postcount status verified MediaUrl college jobs jobProvider createdAt"
      )
      .populate("college")
      .populate("jobLocation");

    res.json({ status: true, data: alumniList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/get/:alumniId", auth, async (req, res) => {
  try {
    const pos11tDet = await Alumni.find({
      _id: req.params.alumniId,
      status: true,
    })
      .select(
        "firstName lastName email phoneNo posts postcount verified MediaUrl status college jobs jobProvider createdAt"
      )
      .populate("college")
      .populate("jobLocation");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

//
router.get("/profile", alumniAuth, async (req, res) => {
  try {
    const postDet = await Alumni.find({
      _id: req.user.user.id,
      status: true,
    })
      .select(
        "firstName lastName email phoneNo MediaUrl posts postcount verified status college jobs jobProvider createdAt"
      )
      .populate("college")
      .populate("jobLocation");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

//
router.get("/admin-get", adminAuth, async (req, res) => {
  try {
    const alumniList = await Alumni.find()
      .select(
        "firstName lastName email phoneNo posts postcount verified MediaUrl status college jobs jobProvider createdAt"
      )
      .populate("college")
      .populate("jobLocation");
    res.json({ status: true, data: alumniList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//
router.get("/admin-get/:alumniId", adminAuth, async (req, res) => {
  console.log(req.params.alumniId);
  try {
    const postDet = await Alumni.find({ _id: req.params.alumniId })
      .select(
        "firstName lastName email phoneNo posts postcount verified status MediaUrl college jobs jobProvider createdAt"
      )
      .populate("college")
      .populate("jobLocation");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

//
router.post("/search", auth, async (req, res) => {
  try {
    var regex = new RegExp(req.body.name, "i");
    const alumniList = await Alumni.find({ name: regex });
    res.json({ status: true, data: alumniList });
  } catch (err) {
    res.json({ message: err });
  }
});

//
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
      let alumni = await Alumni.findOne({ email: email });
      if (!alumni) {
        return res.status(400).json({
          errors: [{ message: "Invalid Credentials, Email not found" }],
        });
      }
      if (alumni.status === true) {
        const isMatch = await bcrypt.compare(password, alumni.password);
        console.log(alumni, isMatch);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ message: "Invalid Credentials" }] });
        }
        console.log(alumni);
        const payload = {
          user: {
            email: alumni.email,
            id: alumni._id,
            alumni: true,
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
                  _id: alumni._id,
                  firstName: alumni.firstName,
                  lastName: alumni.lastName,
                  email: alumni.email,
                  phoneNo: alumni.phoneNo,
                  alumni: alumni.alumni,
                  MediaUrl: alumni.MediaUrl,
                  status: alumni.status,
                  job: alumni.job,
                  jobProvider: alumni.jobProvider,
                  rollNo: alumni.rollNo,
                  college: alumni.college,
                  createdAt: alumni.createdAt,
                  updatedAt: alumni.updatedAt,
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
          message: "alumni is blocked please contact with admin",
        });
      }
    } catch (err) {
      res.json({ status: false, message: "Login failed" });
    }
  }
);

//ADD Alumni
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
    const {
      firstName,
      lastName,
      rollNo,
      collegeId,
      email,
      password,
      phoneNo,
      jobs,
      jobProvider,
    } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    } else {
      if (
        jobs.isLength < 0 ||
        !firstName ||
        !rollNo ||
        !collegeId ||
        !phoneNo ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          status: false,
          errors: {
            message:
              "jobs , firstName ,rollNo ,email,collegeId phoneNo ,password any of should not be empty",
          },
        });
      } else {
        try {
          let alumni = await Alumni.findOne({ email: email });
          if (alumni) {
            return res.status(400).json({
              status: false,
              errors: { message: "Alumni already exists" },
            });
          }
          const salt = await bcrypt.genSalt(10);
          const passwordHased = await bcrypt.hash(password, salt);
          var ramdomNo = Math.floor(100000 + Math.random() * 900000);
          ramdomNo = String(ramdomNo);
          ramdomNo = ramdomNo.substring(0, 4);

          const newAlumni = new Alumni({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNo: phoneNo,
            alumni: true,
            status: true,
            rollNo: rollNo,
            MediaUrl: null,
            jobs: jobs,
            jobProvider: jobProvider,
            verified: false,
            college: collegeId,
            verifyToken: ramdomNo,
            posts: [],
            events: [],
            eventscount: 0,
            password: passwordHased,
          });

          const response = await newAlumni.save();

          if (response) {
            var smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: "singhnitesh9001@gmail.com",
                pass: `${process.env.EMAIL_PASSWORD}`,
              },
            });

            var mailOptions = {
              to: email,
              from: "singhnitesh9001@gmail.com",
              subject: "Verify Account",
              html:
                "<div> <h3 style='color:'blue'> You are receiving this because Alumni " +
                "have requested the verification of account.<br /> Do not share this link with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>Verify with token " +
                ramdomNo +
                "</h1></div>",
            };

            smtpTransport.sendMail(mailOptions, function (err, info) {
              if (err) {
                res.json({
                  status: false,
                  message: "Email not Send to mail",
                });
              } else {
                const alumniOne = Alumni.findOne({ email: email });
                if (!alumniOne)
                  return res.json({
                    status: false,
                    data: "Alumni is not registered",
                  });
                const payload = {
                  user: {
                    email: email,
                    id: alumniOne._id,
                    alumni: true,
                  },
                };
                jwt.sign(payload, process.env.JWT, function (err, token) {
                  console.log(err, token);
                  if (token) {
                    res.json({
                      status: true,
                      data: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        alumni: true,
                        status: false,
                        rollNo: rollNo,
                        jobs: jobs,
                        jobProvider: jobProvider,
                        phoneNo: phoneNo,
                        verified: false,
                        college: collegeId,
                        token: token,
                      },
                    });
                  }
                });
              }
            });
          } else req.send({ status: false, err: "error" });
        } catch (err) {
          console.log(req.body);
          res.json({ status: false, message: "Alumni not added ", error: err });
        }
      }
    }
  }
);

//UPDATE THE Alumni BY ID
router.patch("/:alumniId", auth, async (req, res) => {
  console.log(req.params.alumniId);
  try {
    const alumniData = req.body;
    const changealumni = await Alumni.findOneAndUpdate(
      {
        _id: req.params.alumniId,
      },
      {
        $set: alumniData,
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

//UPDATE THE Alumni BY ID
router.patch("/media/:alumniId", auth, async (req, res) => {
  console.log(req.params.alumniId);
  try {
    const { MediaUrl } = req.body;
    const changeAlumni = await Alumni.findOneAndUpdate(
      {
        _id: req.params.alumniId,
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

//updatepasssword
router.patch("/updatePassword/:alumniId", auth, async (req, res) => {
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
      console.log(req.params.alumniId);
      const passwordHased = await bcrypt.hash(password, salt);
      await Alumni.findByIdAndUpdate(
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

//DELETE THE College BY
router.delete("/delete/:alumniId", auth, async (req, res) => {
  console.log(req.params.alumniId);
  try {
    const removePost = await Alumni.remove({
      _id: req.params.alumniId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

// router.post("/send-email", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const alumniDet = await Alumni.find({ email: email });

//     if (alumniDet) {
//       var smtpTransport = await nodemailer.createTransport({
//         service: "Gmail",
//         auth: {
//           user: "singhnitesh9001@gmail.com",
//           pass: `${process.env.EMAIL_PASSWORD}`,
//         },
//       });
//       var ramdomNo = Math.floor(100000 + Math.random() * 900000);
//       ramdomNo = String(ramdomNo);
//       ramdomNo = ramdomNo.substring(0, 4);
//       console.log(ramdomNo, alumniDet[0]._id);
//       var mailOptions = {
//         to: email,
//         from: "singhnitesh9001@gmail.com",
//         subject: "Verify Account",
//         html:
//           "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
//           ramdomNo +
//           "</h1></div>",
//       };
//       let info = await smtpTransport.sendMail(mailOptions, function (err) {
//         console.log("err", err, alumniDet);
//         if (!err) {
//           res.json({ status: true, message: "Email Send to mail" });
//         } else {
//           res.json({ status: false, message: "Email not Send to mail" });
//         }
//       });
//       const alumniData = {
//         verifyToken: ramdomNo,
//       };
//       const changealumni = await Alumni.findByIdAndUpdate(
//         {
//           _id: alumniDet[0]._id,
//         },
//         {
//           $set: {
//             verifyToken: ramdomNo,
//           },
//         },
//         { upsert: true }
//       );
//     }
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

// router.post("/verify", async (req, res) => {
//   const { email, tokenValue } = req.body;
//   try {
//     if (email || tokenValue) {
//       const alumniDet = await Alumni.find({ email: email });
//       if (alumniDet[0].verifyToken == tokenValue) {
//         const changealumni = await Alumni.findByIdAndUpdate(
//           {
//             _id: alumniDet[0]._id,
//           },
//           {
//             $set: {
//               verified: true,
//               status: true,
//             },
//           },
//           { upsert: true }
//         );
//         res.json({ status: true, message: "verified" });
//       }
//     } else {
//       res.json({ status: false, message: "Email and tokenValue is required" });
//     }
//   } catch (err) {
//     res.json({ status: false, message: "Not verified" });
//   }
// });

router.post("/forgetPassword", async (req, res) => {
  try {
    crypto.randomBytes(20, function (err, buf) {
      var token = buf.toString("hex");
      console.log(token, err);

      Alumni.findOne({ email: req.body.email }).then((response) => {
        console.log(response);
        if (!response)
          return res.json({ status: false, message: "No Alumni found" });
        if (!response.status)
          return res.json({ status: false, message: "Alumni is blocked " });
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          auth: {
            user: "singhnitesh9001@gmail.com",
            pass: `${process.env.EMAIL_PASSWORD}`,
          },
        });
        var ramdomNo = Math.floor(100000 + Math.random() * 900000);
        ramdomNo = String(ramdomNo);
        ramdomNo = ramdomNo.substring(0, 4);
        var mailOptions = {
          to: req.body.email,
          from: "singhnitesh9001@gmail.com",
          subject: "Verify Account",
          html:
            "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
            ramdomNo +
            "</h1></div>",
        };

        smtpTransport.sendMail(mailOptions, function (err) {
          if (!err) {
            res.json({ status: true, message: "Email Send to mail" });
          } else {
            res.json({ status: false, message: "Email not Send to mail" });
          }
        });
        response.resetPasswordToken = token;
        response.verifyToken = ramdomNo;
        response.resetPasswordExpires = Date.now(); // 1 hour
        response.save().then((ress) => {
          return res.json({
            status: true,
            data: ress.resetPasswordToken,
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
    const alumni = await Alumni.findOne({
      resetPasswordToken: req.body.resetPasswordToken,
    });
    if (!alumni)
      return res.json({
        status: false,
        message: "No user is found with this token",
      });
    if (!alumni.resetPasswordToken)
      return res.json({
        status: false,
        message: "password reset link is invalid or has expired",
      });
    if (req.body.otpEmail !== alumni.verifyToken)
      return res.json({
        status: false,
        message: "otp is invalid or has expired",
      });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        alumni.password = hash;
        alumni.save();
        alumni
          .updateOne({
            password: hash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
          })
          .then(() => {
            res.status(200).json({ status: true, message: "password updated" });
          });
      });
    });
  } catch (err) {
    res.status(400).json({ status: false, message: "Some internal Issue" });
  }
});
module.exports = router;
