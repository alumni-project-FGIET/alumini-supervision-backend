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
const adminAuth = require("../Middleware/adminAuth");
require("dotenv").config();

//GET ALL College LIST
router.get("/get", adminAuth, async (req, res) => {
  try {
    const adminList = await Admin.find().select(
      "name email admin phoneNo title createdAt updatedAt"
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
      "name email admin phoneNo title createdAt updatedAt"
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
        return res.json({ errors: [{ msg: "Invalid Credentials" }] });
      }
      if (admin.status) {
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("not", admin.password, isMatch);
        if (!isMatch) {
          return res.json({ errors: [{ msg: "Invalid Credentials" }] });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const { name, email, password, phoneNo, title, status } = req.body;
      try {
        let admin = await Admin.findOne({ email: email });
        if (admin) {
          return res
            .status(400)
            .json({ errors: { msg: "admin already exists" } });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHased = await bcrypt.hash(password, salt);
        const newAdmin = await new Admin({
          name: name,
          email: email,
          admin: true,
          status: status,
          phoneNo: phoneNo,
          password: passwordHased,
          title: title,
        });

        const adminOne = Admin.findOne({ email: email });
        if (!adminOne) {
          return res.status(400).json({
            status: false,
            errors: { msg: "Admin already exists" },
          });
        }

        newAdmin.save();
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
              data: {
                name: name,
                admin: true,
                email: email,
                status: status,
                phoneNo: phoneNo,
                title: title,
                token: token,
              },
            });
          }
        });
      } catch (err) {
        console.log(req.body);
        res.json({ status: false, message: "Admin not added", error: err });
      }
    }
  }
);

//UPDATE THE College BY ID
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

router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  try {
    const adminDet = await Admin.find({ email: email });

    if (adminDet) {
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
      console.log(ramdomNo, adminDet[0]._id);
      var mailOptions = {
        to: email,
        from: "singhnitesh9001@gmail.com",
        subject: "Verify Account",
        html:
          "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have requested the verification for your account.<br /> Do not share this OTP with any other </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
          ramdomNo +
          "</h1></div>",
      };
      let info = await smtpTransport.sendMail(mailOptions, function (err) {
        console.log("err", err, adminDet);
        if (!err) {
          res.json({ status: true, message: "Email Send to mail" });
        } else {
          res.json({ status: false, message: "Email not Send to mail" });
        }
      });
      const adminData = {
        verifyToken: ramdomNo,
      };
      const changeadmin = await Admin.findByIdAndUpdate(
        {
          _id: adminDet[0]._id,
        },
        {
          $set: {
            verifyToken: ramdomNo,
          },
        },
        { upsert: true }
      );
    }
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/verify", async (req, res) => {
  const { email, tokenValue } = req.body;
  try {
    const adminDet = await Admin.find({ email: email });
    if (adminDet[0].verifyToken == tokenValue) {
      const changeadmin = await admin.findByIdAndUpdate(
        {
          _id: adminDet[0]._id,
        },
        {
          $set: {
            verified: true,
          },
        },
        { upsert: true }
      );
      res.json({ status: true, message: "verified" });
    }
  } catch (err) {
    res.json({ status: false, message: "Not verified" });
  }
});

router.post("/forgetPassword", async (req, res) => {
  try {
    const tokenValue = await crypto.randomBytes(20, function (err, buf) {
      var token = buf.toString("hex");
      console.log(token, err);
      Admin.findOne({ email: req.body.email }, function (err, admin) {
        if (!admin) {
          console.log("wrong");
          return res.status(400).json({ errors: "No admin found" });
        }
        admin.resetPasswordToken = token;
        admin.resetPasswordExpires = Date.now(); // 1 hour
        admin.save(function (err) {
          res.json({ status: true, data: "reset Password is set Sucessfully" });
        });
      });
    });
    console.log(tokenValue);
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.post("/reset", async (req, res) => {
  await Admin.findOne({ resetPasswordToken: req.body.resetPasswordToken }).then(
    (admin) => {
      if (admin.resetPasswordToken === null) {
        console.error("password reset link is invalid or has expired");
        res.status(403).json({
          status: true,
          data: "password reset link is invalid or has expired",
        });
      } else if (admin != null) {
        console.log("admin exists in db");
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            admin.password = hash;
            admin
              .save()
              .then((admin) => res.json(admin))
              .catch((err) => console.log(err));
            admin
              .updateOne({
                password: hash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
              })
              .then(() => {
                console.log(`password updated ${admin.password}`);
                res
                  .status(200)
                  .json({ status: true, message: "password updated" });
              });
          });
        });
      } else {
        console.error("no admin exists in db to update");
        res
          .status(401)
          .json({ status: false, data: "no admin exists in db to update" });
      }
    }
  );
});

module.exports = router;
