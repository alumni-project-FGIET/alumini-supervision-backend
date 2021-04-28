const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const Post = require("../Modal/PostModel");
const Alumni = require("../Modal/AlumniModel");
const alumniAuth = require("../Middleware/alumniAuth");
const jwt = require("jsonwebtoken");
const likesModel = require("../Modal/likesModel");
const UserModel = require("../Modal/UserModel");
var ObjectId = require("mongodb").ObjectID;

router.get("/get", auth, async (req, res) => {
  try {
    console.log(req.user);
    const postList = await Post.find({ status: true })
      .select(
        "name status title discription MediaUrl likes alumni date createdAt updatedAt"
      )
      .populate("alumni", "firstName lastName alumni MediaUrl college")
      .populate("likes");
    res.json({ status: true, data: postList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/:postId", auth, async (req, res) => {
  console.log(req.params.postId);
  try {
    const postDet = await Post.findById(req.params.postId)
      .select(
        "name status title discription MediaUrl alumni date createdAt updatedAt"
      )
      .populate("alumni", "firstName lastName email  MediaUrl college");
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.post("/search", auth, async (req, res) => {
  try {
    var regex = new RegExp(req.body.title, "i");
    const postDet = await Post.find({ title: regex });
    res.json({ status: true, data: postDet });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.patch("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // if (!post) return res.status(400).json({ msg: "Post not found" });

    if (req.user.user.alumni) {
      const likesFound = await likesModel.findOne({
        alumni: req.user.user.id,
        post: req.params.post_id,
      });

      if (likesFound) {
        const newpost = post.likes.filter(
          (e) => e.toString() !== likesFound._id.toString()
        );

        post.likes = newpost;
        post.likeCount = newpost.length;

        // await post.save().then((res) => {
        //   console.log(likesFound._id);
        //   if (res) likesModel.remove({ _id: ObjectId(likesFound._id) });
        // });
        console.log(newpost);
      } else {
        const newLike = await new likesModel({
          user: null,
          user: req.user.user.id,
          post: req.params.post_id,
        });
        newLike
          .save()
          .then((res) => {
            post.likes.unshift(res._id);
            post.likeCount = post.likes.length;
            post.save();
          })
          .catch((err) => console.log(err));
      }
    } else {
      const likesFound = await likesModel.findOne({
        user: req.user.user.id,
        post: req.params.post_id,
      });

      if (likesFound) {
        const newpost = post.likes.filter(
          (e) => e.toString() !== likesFound._id.toString()
        );
        post.likes = newpost;
        post.likeCount = newpost.length;
        console.log(newpost);

        // await post.save().then((res) => {
        //   console.log(likesFound._id);
        //   if (res) likesModel.remove({ _id: ObjectId(likesFound._id) });
        // });
      } else {
        const newLike = await new likesModel({
          user: req.user.user.id,
          alumni: null,
          post: req.params.post_id,
        });
        newLike
          .save()
          .then((res) => {
            post.likes.unshift(res._id);
            post.likeCount = post.likes.length;
            post.save();
          })
          .catch((err) => console.log(err));
      }
    }
    res.json({ status: true, data: post });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

router.post("/add", alumniAuth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    console.log(req.user.user);
    const alumniData = await Alumni.findById(userId);

    const newPost = await new Post({
      user: alumniData.id,
      title: req.body.title,
      discription: req.body.discription,
      status: true,
      MediaUrl: req.body.MediaUrl,
    });
    newPost
      .save()
      .then((data) => {
        res.json({
          status: true,
          data: newPost,
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, message: "Post not added " });
      });
  } catch (err) {
    res.json({ status: false, message: "Post not added " });
  }
});

router.delete("/:postId", auth, async (req, res) => {
  console.log(req.params.postId);
  try {
    const removePost = await Post.remove({
      _id: req.params.postId,
    });
    res.json({ status: true, data: removePost });
  } catch (err) {
    res.json({ status: false, message: err });
  }
});

router.patch("/:postId", auth, async (req, res) => {
  console.log(req.params.postId);
  try {
    const udpateData = req.body;
    const changePost = await Post.findOneAndUpdate(
      {
        _id: req.params.postId,
      },
      {
        $set: udpateData,
      },
      { upsert: true }
    );
    res.json({ status: true, data: changePost });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
