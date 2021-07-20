const express = require("express");
const router = express.Router();
const Admin = require("../Modal/AdminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
var dotenv = require("dotenv");
const adminAuth = require("../Middleware/adminAuth");
require("dotenv").config();
const crypto = require("crypto");

//GET ALL College LIST
router.get("/get", adminAuth, async (req, res) => {
  try {
    const adminList = await Admin.find().select(
      "name email admin phoneNo title status createdAt updatedAt"
    );
    res.json({ status: true, data: adminList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE College BY ID
router.get("/get/:adminId", adminAuth, async (req, res) => {
  console.log(req.params.adminId);
  try {
    const adminDet = await Admin.findById(req.params.adminId).select(
      "name email admin phoneNo title status createdAt updatedAt"
    );
    res.json({ status: true, data: adminDet });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET College BY SEARCH
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
      let admin = await Admin.findOne({ email });
      console.log(admin);
      if (!admin) {
        return res.json({ errors: [{ message: "Invalid Credentials" }] });
      }
      if (admin.status) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.json({ errors: [{ message: "Invalid Credentials" }] });
        }
        const payload = {
          user: {
            email: email,
            id: admin._id,
          },
        };
        jwt.sign(payload, process.env.JWT, function (err, token) {
          console.log(err, token);
          if (token) {
            res.json({
              status: true,
              data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                admin: true,
                status: admin.status,
                phoneNo: admin.phoneNo,
                title: admin.title,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                token: token,
              },
            });
            console.log(token);
          } else {
            console.log("yes");
            res.json({ status: false, message: "token not generated " });
          }
        });
      } else {
        console.log("yes");
        res.json({
          status: false,
          message: "Admin is blocked please contact other admin",
        });
      }
    } catch (err) {
      res.json({ status: false, message: "Login failed" });
    }
  }
);

//ADD ADmin
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password, phoneNo, title } = req.body;
      const admin = await Admin.findOne({ email });
      console.log(admin, "no admin");
      if (admin)
        return res.json({ status: true, message: "Admin already exists" });

      const salt = await bcrypt.genSalt(10);
      const passwordHased = await bcrypt.hash(password, salt);

      const newAdmin = new Admin({
        name: name,
        email: email,
        admin: true,
        status: false,
        phoneNo: phoneNo,
        password: passwordHased,
        title: title,
      });
      await newAdmin.save();

      const adminOne = Admin.findOne({ email: email });

      if (!adminOne) {
        return res.status(400).json({
          status: false,
          errors: { message: "Admin already exists" },
        });
      }

      const payload = {
        user: {
          email: email,
          id: adminOne._id,
        },
      };

      jwt.sign(payload, process.env.JWT, function (err, token) {
        console.log(err, token);
        if (token) {
          res.json({
            status: true,
            message: "contact with your team and get verified",
            data: {
              name: name,
              admin: true,
              email: email,
              status: false,
              phoneNo: phoneNo,
              title: title,
              token: token,
            },
          });
        }
      });
    } catch (err) {
      res.json({ status: false, message: "Admin not added", error: err });
    }
  }
);

//UPDATE BY ID
router.patch("/:adminId", adminAuth, async (req, res) => {
  console.log(req.params.adminId);
  try {
    const udpateData = req.body;
    const changeAdmin = await Admin.findOneAndUpdate(
      {
        _id: req.params.adminId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({
      status: true,
      // data: {
      //   _id: changeAdmin._id,
      //   name: changeAdmin.name,
      //   email: changeAdmin.email,
      //   admin: changeAdmin.admin,
      //   status: changeAdmin.status,
      //   phoneNo: changeAdmin.phoneNo,
      //   title: changeAdmin.title,
      //   createdAt: changeAdmin.createdAt,
      //   updatedAt: changeAdmin.updatedAt,
      // },
    });
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/updatePassword/:adminId", adminAuth, async (req, res) => {
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
      await Admin.findByIdAndUpdate(
        {
          _id: req.params.adminId,
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

router.patch("/media/:adminId", adminAuth, async (req, res) => {
  console.log(req.params.adminId);
  try {
    const { MediaUrl } = req.body;
    const changeUser = await Admin.findOneAndUpdate(
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

//DELETE THE College BY ID
router.delete("/:adminId", adminAuth, async (req, res) => {
  console.log(req.params.adminId);
  try {
    const removePost = await Admin.remove({
      _id: req.params.adminId,
    });
    res.json(removePost);
  } catch (err) {
    res.json({ message: err });
  }
});

// router.post("/send-email", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const adminDet = await Admin.find({ email: email });

//     if (adminDet) {
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
//       console.log(ramdomNo, adminDet[0]._id);
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
//         console.log("err", err, adminDet);
//         if (!err) {
//           res.json({ status: true, message: "Email Send to mail" });
//         } else {
//           res.json({ status: false, message: "Email not Send to mail" });
//         }
//       });
//       const adminData = {
//         verifyToken: ramdomNo,
//       };
//       const changeadmin = await Admin.findByIdAndUpdate(
//         {
//           _id: adminDet[0]._id,
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
//     const adminDet = await Admin.find({ email: email });
//     if (adminDet[0].verifyToken == tokenValue) {
//       const changeadmin = await admin.findByIdAndUpdate(
//         {
//           _id: adminDet[0]._id,
//         },
//         {
//           $set: {
//             verified: true,
//           },
//         },
//         { upsert: true }
//       );
//       res.json({ status: true, message: "verified" });
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
      Admin.findOne({ email: req.body.email }).then((response) => {
        console.log(response);
        if (!response)
          return res.json({ status: false, message: "No admin found" });
        if (!response.status)
          return res.json({ status: false, message: "Admin is blocked " });
        response.resetPasswordToken = token;
        response.resetPasswordExpires = Date.now(); // 1 hour
        response.save().then((ress) => {
          console.log(ress);
          return res.json({ status: true, data: ress.resetPasswordToken });
        });
      });
    });
  } catch (err) {
    res.json({ status: false, message: "Internal Server issue" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const admin = await Admin.findOne({
      resetPasswordToken: req.body.resetPasswordToken,
    });
    if (!admin)
      return res.json({
        status: false,
        message: "No admin is found with this token",
      });
    if (!admin.resetPasswordToken)
      return res.json({
        status: false,
        message: "password reset link is invalid or has expired",
      });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        admin.password = hash;
        admin.save();
        admin
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
