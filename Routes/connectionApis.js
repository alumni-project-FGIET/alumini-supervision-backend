const express = require("express");
const { stringify } = require("uuid");
const auth = require("../Middleware/auth");
const router = express.Router();
const AlumniModel = require("../Modal/AlumniModel");
const FriendModel = require("../Modal/FriendModel");
const UserModel = require("../Modal/UserModel");

router.get("/get", auth, async (req, res) => {
  try {
    var isfriend = await FriendModel.find({
      user: req.user.user.id,
      connect: true,
    }).select("targetUser");

    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    const datatest = data;
    var dataNew;

    for (var k in isfriend) {
      dataNew = data.filter(function (n, i) {
        return n._id.toString() !== isfriend[k].targetUser.toString();
      });
      data = dataNew;
    }
    res.json({ status: true, data: data });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.post("/search/:query", async (req, res) => {
  try {
    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const data = alumniList.concat(userList);

    const reg = new RegExp(req.params.query, "i");
    const searchResult = data.filter((item) => {
      let flag = false;
      for (prop in item) {
        if (reg.test(item[prop])) flag = true;
      }
      return flag;
    });

    console.log(searchResult, reg);

    res.json({ status: true, data: searchResult });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.get("/myfriend", auth, async (req, res) => {
  try {
    var isfriend = await FriendModel.find({
      user: req.user.user.id,
      connect: true,
    }).select("targetUser");

    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    const datatest = data;
    var dataNew = [];

    for (var k in isfriend) {
      datatopush = data.filter((n, i) => {
        return n._id.toString() === isfriend[k].targetUser.toString();
      });
      dataNew.push(datatopush[0]);
    }
    res.json({ status: true, data: dataNew });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/profile/:profileId", auth, async (req, res) => {
  try {
    const userId = req.params.profileId;
    var isSame = await FriendModel.find({
      user: userId,
      targetUser: req.user.user.id,
    });
    isSame = await FriendModel.find({
      user: req.user.user.id,
      targetUser: userId,
    });
    console.log(isSame);
    const action = !isSame ? "Add friend " : "Alreday friend";
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

    res.json({ status: true, data: userData, action: action });
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

router.post("/addFriend/:friendId", auth, async (req, res) => {
  try {
    var usertarget;
    usertarget = await AlumniModel.findOne({
      _id: req.params.friendId,
      status: true,
    });
    if (!usertarget)
      usertarget = await UserModel.findOne({
        _id: req.params.friendId,
        status: true,
      });

    const newFriend = new FriendModel({
      user: req.user.user.id,
      targetUser: req.params.friendId,
      connect: false,
      blocked: false,
    });

    var userData = await AlumniModel.findOne({
      _id: req.user.user.id,
      status: true,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    if (!userData)
      userData = await UserModel.findOne({
        _id: req.user.user.id,
        status: true,
      })
        .select("firstName lastName email verified MediaUrl college createdAt")
        .populate("college");

    newFriend.save().then((data) => {
      usertarget.friendList.unshift({
        friend: data._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        MediaUrl: userData.MediaUrl,
        college: userData.college.name,
      });
      usertarget.friendCount = usertarget.friendList.length;
      usertarget.save();
      res.json({
        status: true,
        data: data,
      });
    });
  } catch (err) {
    res.json({ status: false, message: "request not send" });
  }
});

router.patch("/accept/:requestId", auth, async (req, res) => {
  try {
    var usertarget;
    var userData;

    const isSame = await FriendModel.findById({ _id: req.params.requestId });
    if (isSame && isSame.connect) {
      res.json({ status: true, message: "already friend" });
    } else {
      usertarget = await AlumniModel.findOne({
        _id: isSame.user,
        status: true,
      });
      if (!usertarget)
        usertarget = await UserModel.findOne({
          _id: isSame.user,
          status: true,
        });
      userData = await AlumniModel.findOne({
        _id: req.user.user.id,
        status: true,
      });
      if (!userData)
        userData = await UserModel.findOne({
          _id: req.user.user.id,
          status: true,
        });

      console.log(userData, usertarget);
      // if (req.user.user.id.toString() !== isSame.targetUser.toString()) {
      //   res.json({ status: true, message: "error please try again" });
      // }
      if (!req.body.requestValue) {
        await FriendModel.deleteOne({
          _id: req.params.requestId,
        });
        userData.friendList.shift({
          friend: req.params.requestId,
          firstName: usertarget.firstName,
          lastName: usertarget.lastName,
          MediaUrl: usertarget.MediaUrl,
          college: usertarget.college.name,
        });
        userData.friendCount = userData.friendList.length;
        await userData.save();

        res.json({ status: true, message: "friend request rejected" });
      } else {
        await FriendModel.findByIdAndUpdate(
          {
            _id: req.params.requestId,
          },
          {
            $set: {
              connect: true,
            },
          },
          { upsert: true, returnNewDocument: true }
        );
        usertarget.totalFriend = usertarget.totalFriend + 1;
        await usertarget.save();

        userData.totalFriend = userData.totalFriend + 1;
        await userData.save();

        userData.friendList.shift({
          friend: req.params.requestId,
          firstName: usertarget.firstName,
          lastName: usertarget.lastName,
          MediaUrl: usertarget.MediaUrl,
          college: usertarget.college.name,
        });
        userData.friendCount = userData.friendList.length;
        userData.save();
        res.json({
          status: true,
          message: "request accepted",
        });
      }
    }
  } catch (err) {
    res.json({ status: false, message: "something went wrong" });
  }
});

router.patch("/blockUser/:userId", auth, async (req, res) => {
  try {
    const isSame = await FriendModel.findById({
      targetUser: req.params.userId,
      user: req.user.user.id,
    });

    if (!isSame) {
      res.json({ status: true, message: "you are not friends" });
    }
    await FriendModel.findByIdAndUpdate(
      {
        _id: req.params.requestId,
      },
      {
        $set: {
          connect: false,
          blocked: true,
        },
      },
      { upsert: true, returnNewDocument: true }
    );
    res.json({
      status: true,
      message: "user is blocked ",
    });
  } catch (err) {
    res.json({ status: false, message: "something went wrong" });
  }
});

module.exports = router;
