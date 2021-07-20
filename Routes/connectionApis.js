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
    var usercode = await AlumniModel.findById({
      _id: req.user.user.id,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    if (!usercode)
      usercode = await UserModel.findById({
        _id: req.user.user.id,
      })
        .select("firstName lastName email verified MediaUrl college createdAt")
        .populate("college");
    console.log(usercode);
    var isfriend = await FriendModel.find({
      user: req.user.user.id,
    }).select("targetUser");

    const alumniList = await AlumniModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({ status: true })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    var dataNew;

    for (var k in isfriend) {
      dataNew = data.filter(function (n, i) {
        return (
          n._id.toString() !== isfriend[k].targetUser.toString() &&
          n.college.collegeCode === usercode.college.collegeCode &&
          n._id !== req.user.user.id
        );
      });
      data = dataNew;
    }
    // const dataFilter = data.filter(function (d, i) {
    //   return (
    //     d.college.collegeCode === userCode[0].college.collegeCode &&
    //     d._id !== req.user.user.id
    //   );
    // });

    res.json({ status: true, data: dataNew });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/pending", auth, async (req, res) => {
  try {
    const send = await FriendModel.find({
      user: req.user.user.id,
      connect: false,
    });
    const received = await FriendModel.find({
      targetUser: req.user.user.id,
      connect: false,
    });
    // var send = await FriendModel.find({
    //   user: req.user.user.id,
    //   connect: false,
    // }).select("targetUser");
    // console.log(send);
    // var received = await FriendModel.find({
    //   targetUser: req.user.user.id,
    //   connect: false,
    // }).select("user");
    // console.log(received);

    // const alumniList = await AlumniModel.find({ status: true })
    //   .select("firstName lastName email verified MediaUrl college createdAt")
    //   .populate("college");

    // const userList = await UserModel.find({ status: true })
    //   .select("firstName lastName email verified MediaUrl college createdAt")
    //   .populate("college");

    // var data = alumniList.concat(userList);
    // console.log(data);
    // var dataNew = [];
    // var dataRec = [];

    // for (var k in send) {
    //   datatopush = data.filter((n, i) => {
    //     return n._id.toString() === send[k].targetUser.toString();
    //   });
    //   dataNew.push(datatopush[0]);
    // }
    // for (var k in received) {
    //   datatReco = data.filter((n, i) => {
    //     return n._id.toString() === received[k].user.toString();
    //   });
    //   dataRec.push(datatReco[0]);
    // }
    res.json({
      status: true,
      invitationSend: send,
      invitaionReceived: received,
    });
  } catch (err) {
    res.json({ status: false, message: "Something went wrong" });
  }
});

router.post("/addFriend/:friendId", auth, async (req, res) => {
  try {
    var usertarget;
    const isSame = await FriendModel.findOne({
      targetUser: req.params.friendId,
      user: req.user.user.id,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    usertarget = await AlumniModel.findOne({
      _id: req.params.friendId,
      status: true,
    });
    if (!usertarget)
      usertarget = await UserModel.findOne({
        _id: req.params.friendId,
        status: true,
      })
        .select("firstName lastName email verified MediaUrl college createdAt")
        .populate("college");

    // var userData = await AlumniModel.findOne({
    //   _id: req.user.user.id,
    //   status: true,
    // })
    //   .select("firstName lastName email verified MediaUrl college createdAt")
    //   .populate("college");
    // if (!userData)
    //   userData = await UserModel.findOne({
    //     _id: req.user.user.id,
    //     status: true,
    //   })
    //     .select("firstName lastName email verified MediaUrl college createdAt")
    //     .populate("college");

    if (isSame) {
      await FriendModel.deleteOne({
        targetUser: req.params.friendId,
        user: req.user.user.id,
      });
      // usertarget.friendList.shift({
      //   friend: req.params.requestId,
      // });
      // usertarget.friendCount = usertarget.friendList.length;
      // await usertarget.save();

      res.json({ status: true, message: "friend request Cancelled" });
    } else {
      console.log("hello");
      const newFriend = new FriendModel({
        user: req.user.user.id,
        targetUser: req.params.friendId,
        connect: false,
        blocked: false,
        target: {
          firstName: usertarget.firstName,
          lastName: usertarget.lastName,
          MediaUrl: usertarget.MediaUrl,
          college: usertarget.college.name,
          MediaUrl: usertarget.MediaUrl,
        },
      });
      console.log(newFriend);
      await newFriend.save();
      // .then((data) => {
      //   usertarget.friendList.unshift({
      //     friend: data.id,
      //     firstName: userData.firstName,
      //     lastName: userData.lastName,
      //     MediaUrl: userData.MediaUrl,
      //     college: userData.college.name,
      //   });
      //   usertarget.friendCount = usertarget.friendList.length;
      //   usertarget.save();
      res.json({
        status: true,
        data: "Send Successfully",
      });
      // });
    }
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

      if (!req.body.requestValue) {
        await FriendModel.deleteOne({
          _id: req.params.requestId,
        });
        // userData.friendList.shift({
        //   friend: req.params.requestId,
        //   firstName: usertarget.firstName,
        //   lastName: usertarget.lastName,
        //   MediaUrl: usertarget.MediaUrl,
        //   college: usertarget.college.name,
        // });
        // userData.friendCount = userData.friendList.length;
        // await userData.save();

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

        // userData.friendList.shift({
        //   friend: req.params.requestId,
        //   firstName: usertarget.firstName,
        //   lastName: usertarget.lastName,
        //   MediaUrl: usertarget.MediaUrl,
        //   college: usertarget.college.name,
        // });
        // userData.friendCount = userData.friendList.length;
        // userData.save();
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
