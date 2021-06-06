const express = require("express");
const adminAuth = require("../Middleware/adminAuth");
const auth = require("../Middleware/auth");
const AlumniModel = require("../Modal/AlumniModel");
const EventModel = require("../Modal/EventModel");
const UserModel = require("../Modal/UserModel");
const router = express.Router();

router.get("/get", async (req, res) => {
  try {
    const eventList = await EventModel.find({ status: true })
      .select(
        "title description eventCode venue date alumnis users MediaUrl createdAt updatedAt"
      )
      .populate("alumnis", "email phoneNo lastName firstName MediaUrl college")
      .populate("users", "email phoneNo lastName firstName MediaUrl college");
    res.json({ status: true, data: eventList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/get-admin", adminAuth, async (req, res) => {
  try {
    const eventList = await EventModel.find()
      .select(
        "title description eventCode status venue date alumnis users MediaUrl createdAt updatedAt"
      )
      .populate("alumnis", "email phoneNo lastName firstName MediaUrl college")
      .populate("users", "email phoneNo lastName firstName MediaUrl college");
    res.json({ status: true, data: eventList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

//GET ONE event BY ID
router.get("get/:eventId", async (req, res) => {
  console.log(req.params.eventId);
  try {
    const postDet = await EventModel.findOne({
      _id: req.params.eventId,
      status: true,
    })
      .select(
        "title description eventCode venue date alumnis users MediaUrl createdAt updatedAt"
      )
      .populate("alumnis", "email phoneNo lastName firstName MediaUrl college")
      .populate("users", "email phoneNo lastName firstName MediaUrl college");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/get-admin/:eventId", async (req, res) => {
  console.log(req.params.eventId);
  try {
    const postDet = await EventModel.findById(req.params.eventId)
      .select(
        "title description eventCode status venue date alumnis users MediaUrl createdAt updatedAt"
      )
      .populate("alumnis", "email phoneNo lastName firstName MediaUrl college")
      .populate("users", "email phoneNo lastName firstName MediaUrl college");

    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ message: err });
  }
});

// GET event BY SEARCH
router.post("/search", async (req, res) => {
  try {
    var regex = new RegExp(req.body.title, "i");
    const postDet = await EventModel.find({ title: regex });
    res.json(postDet);
  } catch (err) {
    res.json({ message: err });
  }
});

//ADD event
router.post("/add", auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    var userData;
    var ramdomNo = Math.floor(100000 + Math.random() * 900000);
    ramdomNo = String(ramdomNo);
    ramdomNo = ramdomNo.substring(0, 4);

    if (req.user.user.alumni === true) {
      userData = await AlumniModel.findOne({ _id: userId, status: true });
      const newPost = new EventModel({
        title: req.body.title,
        description: req.body.description,
        eventCode: ramdomNo,
        status: true,
        venue: req.body.venue,
        date: req.body.date,
        alumnis: userData._id,
        MediaUrl: req.body.MediaUrl,
      });
      console.log(newPost);
      newPost.save().then((data) => {
        userData.events.unshift(data._id);
        userData.eventscount = userData.events.length;
        console.log("data", data);
        userData.save();
        res.json({
          status: true,
          data: data,
        });
      });
    } else {
      userData = await UserModel.findOne({
        _id: userId,
        status: true,
      });
      const newPost = new EventModel({
        title: req.body.title,
        description: req.body.description,
        eventCode: ramdomNo,
        status: true,
        venue: req.body.venue,
        date: req.body.date,
        users: userData._id,
        MediaUrl: req.body.MediaUrl,
      });
      console.log(newPost);
      newPost.save().then((data) => {
        userData.events.unshift(data._id);
        userData.eventscount = userData.events.length;
        console.log("data", data);
        userData.save();
        res.json({
          status: true,
          data: data,
        });
      });
    }
    if (!userData)
      return res.json({
        status: false,
        message: "user not found or blocked ",
      });
  } catch (err) {
    res.json({ status: false, message: "Event not added " });
  }
});

router.patch("/delete/:eventId", auth, async (req, res) => {
  try {
    const eventDet = await EventModel.findById(req.params.eventId);
    const dataToMatch = eventDet.alumnis
      ? eventDet.alumnis
      : eventDet.users
      ? eventDet.users
      : "";
    if (!(dataToMatch.toString() === req.user.user.id.toString()))
      return res.json({
        status: false,
        message: "Event or no auth to delete found",
      });
    if (!eventDet.users) {
      const alumniData = await AlumniModel.findOne({
        _id: req.user.user.id,
        status: true,
      });
      alumniData.events.shift(req.params.eventId);
      alumniData.eventscount = alumniData.events.length;
      alumniData.save();
    } else {
      const userData = await UserModel.findOne({
        _id: req.user.user.id,
        status: true,
      });
      userData.events.shift(req.params.eventId);
      userData.eventscount = userData.events.length;
      userData.save();
    }
    eventDet.remove({ _id: req.params.eventId }, function (err) {
      if (!err)
        return res.json({
          status: true,
          message: "Event Deleted",
        });
    });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: "Something happens worng" });
  }
});

router.patch("/:eventId", auth, async (req, res) => {
  console.log(req.params.eventId);
  try {
    const post = await EventModel.findById(req.params.eventId);
    if (!post) return res.json({ status: false, message: "No post found" });

    const udpateData = req.body;
    const changePost = await EventModel.findOneAndUpdate(
      {
        _id: req.params.eventId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changePost });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

module.exports = router;
