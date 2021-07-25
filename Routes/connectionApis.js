const express = require("express");
const { stringify } = require("uuid");
const alumniAuth = require("../Middleware/alumniAuth");
const auth = require("../Middleware/auth");
const router = express.Router();
const AlumniModel = require("../Modal/AlumniModel");
const FriendModel = require("../Modal/FriendModel");
const UserModel = require("../Modal/UserModel");

router.get("/get", alumniAuth, async (req, res) => {
  try {
    var usercode = await AlumniModel.findById({
      _id: req.user.user.id,
    });

    if (!usercode)
      usercode = await UserModel.findById({
        _id: req.user.user.id,
      });

    var isfriend = await FriendModel.find({
      user: req.user.user.id,
      blocked: false,
    }).select("targetUser");

    var isfriends = await FriendModel.find({
      targetUser: req.user.user.id,
      blocked: false,
    }).select("user");

    var dataFriend = isfriends.concat(isfriend);

    const alumniList = await AlumniModel.find({
      status: true,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({
      status: true,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    var dataNew;
    if (dataFriend.length === 0) {
      dataNew = data.filter(function (n, i) {
        return n._id.toString() !== req.user.user.id.toString();
      });
      res.json({ status: true, data: dataNew });
    } else {
      dataFriend.map((d, k) => {
        dataNew = data.filter(function (n, i) {
          var stor = d.targetUser ? d.targetUser.toString() : d.user.toString();
          return (
            n._id.toString() !== stor &&
            n._id.toString() !== req.user.user.id.toString()
          );
        });
        console.log(dataNew, k);
        data = dataNew;
      });
      res.json({ status: true, data: dataNew });
    }
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
    var usercode = await AlumniModel.findById({
      _id: req.user.user.id,
    });

    if (!usercode)
      usercode = await UserModel.findById({
        _id: req.user.user.id,
      });

    var isfriend = await FriendModel.find({
      user: req.user.user.id,
      connect: true,
    }).select("targetUser");

    var isfriends = await FriendModel.find({
      targetUser: req.user.user.id,
      connect: true,
    }).select("user");

    var dataFriend = isfriends.concat(isfriend);

    const alumniList = await AlumniModel.find({
      status: true,
      college: usercode.college,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({
      status: true,
      college: usercode.college,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    var dataNew = [];
    if (dataFriend.length === 0) {
      // dataNew = data.filter(function (n, i) {
      //   return n._id.toString() !== req.user.user.id.toString();
      // });
      res.json({ status: true, data: dataNew });
    } else {
      dataFriend.map((d, k) => {
        datatopush = data.filter(function (n, i) {
          var stor = d.targetUser ? d.targetUser.toString() : d.user.toString();
          return n._id.toString() === stor;
        });
        console.log(dataNew[0]);
        dataNew.push(datatopush[0]);
        // data = datatopush;
      });
      res.json({ status: true, data: dataNew });
    }
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
    });

    if (!usercode)
      usercode = await UserModel.findById({
        _id: req.user.user.id,
      });

    var isfriend = await FriendModel.find({
      user: req.user.user.id,
      blocked: false,
    }).select("targetUser");

    var isfriends = await FriendModel.find({
      targetUser: req.user.user.id,
      blocked: false,
    }).select("user");

    var dataFriend = isfriends.concat(isfriend);

    const alumniList = await AlumniModel.find({
      status: true,
      college: usercode.college,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    const userList = await UserModel.find({
      status: true,
      college: usercode.college,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");

    var data = alumniList.concat(userList);
    var dataNew;
    if (dataFriend.length === 0) {
      dataNew = data.filter(function (n, i) {
        return n._id.toString() !== req.user.user.id.toString();
      });
      res.json({ status: true, data: dataNew });
    } else {
      dataFriend.map((d, k) => {
        dataNew = data.filter(function (n, i) {
          var stor = d.targetUser ? d.targetUser.toString() : d.user.toString();
          return (
            n._id.toString() !== stor &&
            n._id.toString() !== req.user.user.id.toString()
          );
        });
        console.log(dataNew, k);
        data = dataNew;
      });
      res.json({ status: true, data: dataNew });
    }
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/pending", auth, async (req, res) => {
  try {
    const send = await FriendModel.find({
      user: req.user.user.id,
      connect: false,
    }).select(
      "user targetUser target users connect blocked createdAt updatedAt"
    );
    const received = await FriendModel.find({
      targetUser: req.user.user.id,
      connect: false,
    }).select(
      "user targetUser target users connect blocked createdAt updatedAt"
    );
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
    var users;
    const isSame = await FriendModel.findOne({
      targetUser: req.params.friendId,
      user: req.user.user.id,
    });
    usertarget = await AlumniModel.findOne({
      _id: req.params.friendId,
      status: true,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    if (!usertarget)
      usertarget = await UserModel.findOne({
        _id: req.params.friendId,
        status: true,
      })
        .select("firstName lastName email verified MediaUrl college createdAt")
        .populate("college");
    user = await AlumniModel.findOne({
      _id: req.user.user.id,
      status: true,
    })
      .select("firstName lastName email verified MediaUrl college createdAt")
      .populate("college");
    if (!user)
      user = await UserModel.findOne({
        _id: req.user.user.id,
        status: true,
      })
        .select("firstName lastName email verified MediaUrl college createdAt")
        .populate("college");

    if (isSame) {
      await FriendModel.deleteOne({
        targetUser: req.params.friendId,
        user: req.user.user.id,
      });

      res.json({ status: true, data: "friend request Cancelled" });
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
        users: {
          firstName: user.firstName,
          lastName: user.lastName,
          MediaUrl: user.MediaUrl,
          college: user.college.name,
          MediaUrl: user.MediaUrl,
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
      res.json({ status: true, data: "already friend" });
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

        res.json({ status: true, data: "friend request rejected" });
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
          data: "request accepted",
        });
      }
    }
  } catch (err) {
    res.json({ status: false, message: "something went wrong" });
  }
});

router.delete("/unfriend/:friendId", auth, async (req, res) => {
  try {
    var isfriend;
    isfriend = await FriendModel.findById({
      user: req.params.friendId,
      targetUser: req.user.user.id,
      connect: true,
    });
    if (!isfriend) {
      isfriend = await FriendModel.findById({
        targetUser: req.params.friendId,
        user: req.user.user.id,
        connect: true,
      });
    }
    if (isfriend) {
      await FriendModel.remove({
        _id: isfriend.id,
      });
      res.json({
        status: true,
        message: "Unfriend Successfully ",
      });
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
      res.json({ status: true, data: "you are not friends" });
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
      data: "user is blocked ",
    });
  } catch (err) {
    res.json({ status: false, message: "something went wrong" });
  }
});

module.exports = router;
