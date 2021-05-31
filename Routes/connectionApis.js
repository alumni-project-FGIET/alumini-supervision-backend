const express = require("express");
const auth = require("../Middleware/auth");
const router = express.Router();
const AlumniModel = require("../Modal/AlumniModel");
const UserModel = require("../Modal/UserModel");

router.get("/get", async (req, res) => {
  try {
    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    const data = alumniList.concat(userList);
    res.json({ status: true, data: data });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/profile/:profileId", async (req, res) => {
  try {
    const userId = req.params.profileId;
    var userData;
    userData = await AlumniModel.findOne({ _id: userId, status: true });
    if (!userData)
      userData = await UserModel.findOne({
        _id: userId,
        status: true,
      });
    if (!userData)
      return res.json({
        status: false,
        message: "user not found or blocked ",
      });
    res.json({ status: true, data: userData });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/suggest", auth, async (req, res) => {
  try {
    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    const data = alumniList.concat(userList);
    const userCode = await data.filter(function (n, j) {
      return n.id === req.user.user.id;
    });
    console.log(userCode, req.user.user.id);
    const dataFilter = data.filter(function (d, i) {
      return d.college.collegeCode === userCode[0].college.collegeCode;
    });
    res.json({ status: true, data: dataFilter });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

module.exports = router;
