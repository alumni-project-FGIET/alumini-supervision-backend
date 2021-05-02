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
const CommentModel = require("../Modal/CommentModel");

router.get("/get-likes", auth, async (req, res) => {
  try {
    const postList = await Post.find({ status: true })
      .select("likesUser likeCount")
      .populate({
        path: "likesUser",
        model: "likes",
        select: "alumni user post date",
        populate: {
          path: "alumni",
          model: "alumnis",
          select: "firstName lastName email college",
        },
      })
      .populate({
        path: "likesUser",
        model: "likes",
        populate: {
          path: "user",
          model: "users",
          select: "firstName lastName email college",
        },
      });

    res.json({ status: true, data: postList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/get", auth, async (req, res) => {
  try {
    const postList = await Post.find({ status: true })
      .select(
        "name  title discription MediaUrl likesUser likeCount alumni date createdAt updatedAt"
      )
      .populate("alumni", "firstName lastName alumni MediaUrl college");

    res.json({ status: true, data: postList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/:postId", auth, async (req, res) => {
  try {
    const postDet = await Post.findById(req.params.postId)
      .select(
        "name  title discription MediaUrl likesUser likeCount alumni date createdAt updatedAt"
      )
      .populate("alumni", "firstName lastName email MediaUrl college")
      .populate({
        path: "likesUser",
        model: "likes",
        select: "alumni user post date",
      });
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
    if (!post) return res.json({ status: false, message: "No post found" });
    if (!req.user.user.alumni) {
      const likesFound = await likesModel.findOne({
        $and: [{ user: req.user.user.id }, { post: req.params.post_id }],
      });

      if (!likesFound) {
        console.log(req.user.user.id, req.params.post_id);

        const newLike = new likesModel({
          user: req.user.user.id,
          alumni: null,
          post: req.params.post_id,
        });

        newLike.save().then((response) => {
          post.likesUser.unshift(response._id);
          post.likeCount = post.likesUser.length;
          post.save();
        });
      } else {
        const newpost = post.likesUser.filter(
          (e) => e.toString() !== likesFound._id.toString()
        );
        await Post.updateOne(
          { _id: post._id },
          {
            $set: { likesUser: newpost, likeCount: newpost.length },
            $currentDate: { lastModified: true },
          },
          function (err, result) {
            if (err) throw err;
          }
        );
        await likesModel.remove({ _id: likesFound._id });
      }
    } else {
      const likesFound = await likesModel.findOne({
        $and: [{ alumni: req.user.user.id }, { post: req.params.post_id }],
      });

      if (!likesFound) {
        const newLike = new likesModel({
          user: null,
          alumni: req.user.user.id,
          post: req.params.post_id,
        });

        newLike.save().then((response) => {
          post.likesUser.unshift(response._id);
          post.likeCount = post.likesUser.length;
          post.save();
        });
      } else {
        const newpost = post.likesUser.filter(
          (e) => e.toString() !== likesFound._id.toString()
        );
        await Post.updateOne(
          { _id: post._id },
          {
            $set: { likesUser: newpost, likeCount: newpost.length },
            $currentDate: { lastModified: true },
          },
          function (err, result) {
            if (err) throw err;
          }
        );
        await likesModel.remove({ _id: likesFound._id });
      }
    }
    res.json({ status: true, data: post });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: false, message: "Server Error", errors: e });
  }
});

router.patch("/comments/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.json({ status: false, message: "No post found" });
    if (!req.user.user.alumni) {
      const newcomment = new CommentModel({
        user: req.user.user.id,
        alumni: null,
        comment: req.body.comment,
        post: req.params.post_id,
      });
      newcomment.save().then((response) => {
        post.comments.unshift(response._id);
        post.commentCount = post.commentUser.length;
        post.save();
      });
    }
    {
      //     console.log(req.user.user.id, req.params.post_id);
      //     const newLike = new likesModel({
      //       user: null,
      //       alumni: req.user.user.id,
      //       post: req.params.post_id,
      //     });
      //     newLike.save().then((response) => {
      //       post.likesUser.unshift(response._id);
      //       post.likeCount = post.likesUser.length;
      //       post.save();
      //     });
      //   } else {
      //     const newpost = post.likesUser.filter(
      //       (e) => e.toString() !== likesFound._id.toString()
      //     );
      //     await Post.updateOne(
      //       { _id: post._id },
      //       {
      //         $set: { likesUser: newpost, likeCount: newpost.length },
      //         $currentDate: { lastModified: true },
      //       },
      //       function (err, result) {
      //         if (err) throw err;
      //         console.log(likesFound._id);
      //       }
      //     );
      //     await likesModel.remove({ _id: likesFound._id });
      //   }
    }
    // res.json({ status: true, data: post });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: false, message: "Server Error", errors: e });
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
      likesUser: [],
      likeCount: null,
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
