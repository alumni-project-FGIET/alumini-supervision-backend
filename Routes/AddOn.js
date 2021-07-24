const express = require("express");
const router = express.Router();
const adminAuth = require("../Middleware/adminAuth");
const Report = require("../Modal/Report");
const TermsCon = require("../Modal/TermsCon");
const { google } = require("googleapis");

//GET ALL terms LIST
router.get("/term/get", async (req, res) => {
  try {
    const terms = await TermsCon.find({ status: true });
    res.json({ status: true, data: terms });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//ADD TERMS and CONDITION
router.post("/term/add", adminAuth, async (req, res) => {
  try {
    if (req.body.description) {
      const terms = await new TermsCon({
        description: req.body.description,
        status: req.body.status,
      });
      terms.save().then((data) => {
        res.json({
          status: true,
          data: terms,
        });
      });
    } else {
      res.json({ status: false, message: "description should not be null" });
    }
  } catch (err) {
    res.json({ status: false, message: "Terms and Condition not added " });
  }
});

//UPDATE Terms
router.patch("/term/:termId", adminAuth, async (req, res) => {
  try {
    const udpateData = req.body;
    const changesData = await College.findOneAndUpdate(
      {
        _id: req.params.termId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changesData });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

//get report
router.get("/term/get", async (req, res) => {
  try {
    const reportDet = await Report.find({
      status: req.body.status,
    });
    res.json({ status: true, data: reportDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});
//add report
router.post("/report/add", async (req, res) => {
  try {
    const report = await new Report({
      email: req.body.email,
      name: req.body.name,
      status: req.body.status,
      title: req.body.title,
      MediaUrl: req.body.MediaUrl,
      details: req.body.details,
    });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENTID,
      process.env.CLINETSECERT,
      process.env.REDIRECTURI
    );
    oAuth2Client.setCredentials({
      refresh_token: process.env.CLIENTREFRESHTOKEN,
    });
    const accessToken = await oAuth2Client.getAccessToken();
    var smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "niteshsingh9001@gmail.com",
        clientId: process.env.CLIENTID,
        clientSecret: process.env.CLINETSECERT,
        refreshToken: process.env.CLIENTREFRESHTOKEN,
        accessToken: accessToken,
      },
    });

    var mailOptions = {
      to: email,
      from: "niteshsingh9001@gmail.com",
      subject: "Token of Thanks for your support",
      html:
        "<div><h3 style='color:'blue'> You are receiving this because you (or someone else) have registered the report .<br /> We are reviwing this report . </h3> <h3>If you did not request this, please ignore this email </h3> <h1 style='color:red;background:pink;textAlign:center'>" +
        "Please do not reply back to this email" +
        "<h3> Thanks once again </h3>" +
        "</h1></div>",
    };
    smtpTransport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.json({ status: false, message: "Email not Send to mail" });
      } else {
        report.save().then((data) => {
          res.json({
            status: true,
            data: "Your report is regsitered successfully",
          });
        });
      }
    });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

//GET ONE Report BY ID
router.get("/report/get/:reportId", async (req, res) => {
  try {
    const reportDet = await Report.findById({
      _id: req.params.reportId,
      status: req.body.status,
    });
    res.json({ status: true, data: reportDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

//DELETE THE College BY ID
router.delete("/report/:reportId", adminAuth, async (req, res) => {
  try {
    const removePost = await Report.findById({
      _id: req.params.reportId,
      status: "Completed",
    });
    res.json({ status: true, removePost: removePost });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.patch("/report/:reportId", async (req, res) => {
  try {
    const udpateData = req.body;
    const changeCollege = await Report.findOneAndUpdate(
      {
        _id: req.params.reportId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changeCollege });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

module.exports = router;
