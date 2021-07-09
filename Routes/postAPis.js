const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const Post = require("../Modal/PostModel");
const Alumni = require("../Modal/AlumniModel");
const alumniAuth = require("../Middleware/alumniAuth");
const likesModel = require("../Modal/likesModel");
const UserModel = require("../Modal/UserModel");
var ObjectId = require("mongodb").ObjectID;
const CommentModel = require("../Modal/CommentModel");
const repliesModel = require("../Modal/repliesModel");

router.get("/likes-Comment/:postId", auth, async (req, res) => {
  try {
    const postList = await Post.findOne({
      _id: req.params.postId,
      status: true,
    })
      .select("likesUser likeCount comments commentCount createdAt updatedAt")
      .populate({
        path: "comments",
        model: "comments",
        select:
          "alumni user replyCount replies comment post date createdAt updatedAt",
        populate: {
          path: "alumni",
          model: "alumnis",
          select: "firstName lastName email college",
          populate: {
            path: "college",
            model: "colleges",
            select: "name",
          },
        },
      })
      .populate({
        path: "comments",
        model: "comments",
        select:
          "alumni user replyCount replies comment post date createdAt updatedAt",
        populate: {
          path: "replies",
          model: "replies",
          select: "reply alumni user createdAt updatedAt",
          populate: {
            path: "alumni",
            model: "alumnis",
            select: "firstName lastName email college",
            populate: {
              path: "college",
              model: "colleges",
              select: "name",
            },
          },
        },
      })
      .populate({
        path: "comments",
        model: "comments",
        select:
          "alumni user replyCount replies comment post date createdAt updatedAt",
        populate: {
          path: "replies",
          model: "replies",
          select: "reply alumni user",
          populate: {
            path: "user",
            model: "users",
            select: "firstName lastName email college",
            populate: {
              path: "college",
              model: "colleges",
              select: "name",
            },
          },
        },
      })
      .populate({
        path: "comments",
        model: "comments",
        select:
          "alumni user replyCount replies comment post date createdAt updatedAt",
        populate: {
          path: "user",
          model: "users",
          select: "firstName lastName email college",
          populate: {
            path: "college",
            model: "colleges",
            select: "name",
          },
        },
      })
      .populate({
        path: "likesUser",
        model: "likes",
        select: "alumni user post date",
        populate: {
          path: "alumni",
          model: "alumnis",
          select: "firstName lastName email college",
          populate: {
            path: "college",
            model: "colleges",
            select: "name",
          },
        },
      })
      .populate({
        path: "likesUser",
        model: "likes",
        populate: {
          path: "user",
          model: "users",
          select: "firstName lastName email college",
          populate: {
            path: "college",
            model: "colleges",
            select: "name",
          },
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
        "name  title discription MediaUrl likesUser comments commentCount likeCount  alumni date createdAt updatedAt"
      )
      .populate({
        path: "alumni",
        model: "alumnis",
        select: "firstName lastName alumni MediaUrl college",
        populate: {
          path: "college",
          model: "colleges",
          select: "name",
        },
      });

    res.json({ status: true, data: postList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const postList = await Post.find({ alumni: req.user.user.id, status: true })
      .select(
        "name  title discription MediaUrl likesUser comments commentCount likeCount  alumni date createdAt updatedAt"
      )
      .populate("alumni", "firstName lastName alumni MediaUrl college");
    res.json({ status: true, data: postList });
  } catch (err) {
    res.json({ status: false, message: "Data not Found" });
  }
});

router.get("/get", auth, async (req, res) => {
  try {
    const postList = await Post.find({ status: true })
      .select(
        "name  title discription MediaUrl likesUser comments commentCount likeCount  alumni date createdAt updatedAt"
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
    if (!req.body.comment)
      return res.json({ status: false, message: "please send comment data" });
    if (!req.user.user.alumni) {
      const newcomment = new CommentModel({
        user: req.user.user.id,
        alumni: null,
        comment: req.body.comment,
        post: req.params.post_id,
      });
      newcomment.save().then((response) => {
        post.comments.unshift(response._id);
        post.commentCount = post.comments.length;
        post.save();
      });
    } else {
      const newcomment = new CommentModel({
        user: null,
        alumni: req.user.user.id,
        comment: req.body.comment,
        post: req.params.post_id,
      });
      newcomment.save().then((response) => {
        post.comments.unshift(response._id);
        post.commentCount = post.comments.length;
        post.save();
      });
    }
    res.json({ status: true, data: post });
  } catch (e) {
    res.status(500).json({ status: false, message: "Server Error", errors: e });
  }
});

router.patch("/reply/:comment_id", auth, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.comment_id);
    if (!comment)
      return res.json({ status: false, message: "No comment found" });
    if (!req.body.reply)
      return res.json({ status: false, message: "please send reply data" });
    if (!req.user.user.alumni) {
      const newreplies = new repliesModel({
        user: req.user.user.id,
        alumni: null,
        reply: req.body.reply,
        post: comment.post,
        comment: req.params.comment_id,
      });
      newreplies.save().then((response) => {
        // CommentModel.replyCount = 1;

        comment.replies.unshift(response._id);
        comment.replyCount = comment.replies.length;
        comment.save();
      });
    } else {
      const newreplies = new repliesModel({
        user: null,
        alumni: req.user.user.id,
        reply: req.body.reply,
        post: comment.post,
        comment: req.params.comment_id,
      });
      newreplies.save().then((response) => {
        comment.replies.unshift(response._id);
        comment.replyCount = comment.replies.length;
        comment.save();
      });
    }
    res.json({ status: true, message: "Reply added to comment" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: false, message: "Server Error", errors: e });
  }
});

router.post("/add", alumniAuth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const alumniData = await Alumni.findOne({ _id: userId, status: true });
    if (!alumniData)
      return res.json({
        status: false,
        message: "Alumni not found or blocked ",
      });
    const newPost = new Post({
      title: req.body.title,
      discription: req.body.discription,
      status: true,
      likesUser: [],
      likeCount: null,
      alumni: userId,
      MediaUrl: req.body.MediaUrl,
    });
    newPost.save().then((data) => {
      alumniData.posts.unshift(data._id);
      alumniData.postcount = alumniData.posts.length;
      console.log("data", data);
      alumniData.save();
      res.json({
        status: true,
        data: data,
      });
    });
  } catch (err) {
    res.json({ status: false, message: "Post not added " });
  }
});

router.patch("/comments/edit/:comment_id", auth, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.comment_id);
    if (!comment)
      return res.json({ status: false, message: "No comment found" });

    await CommentModel.findOneAndUpdate(
      { _id: req.params.comment_id },
      {
        $set: {
          comment: req.body.comment,
        },
      },
      function (err, doc) {
        if (!err)
          return res.json({ status: true, message: "Edited successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

router.patch("/reply/edit/:reply_id", auth, async (req, res) => {
  try {
    const replies = await repliesModel.findById(req.params.reply_id);
    if (!replies)
      return res.json({ status: false, message: "No replies found" });

    await repliesModel.findOneAndUpdate(
      { _id: req.params.reply_id },
      {
        $set: {
          reply: req.body.reply,
        },
      },
      function (err, doc) {
        if (!err)
          return res.json({ status: true, message: "Edited successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

router.patch("/comments/delete/:comment_id", auth, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.comment_id);
    if (!comment)
      return res.json({ status: false, message: "No comment found" });

    const postDet = await Post.findById(comment.post);
    if (!postDet) return res.json({ status: false, message: "No Post found" });

    await Post.findOneAndUpdate(
      { _id: comment.post },
      {
        $set: {
          commentCount: postDet.commentCount - 1,
        },
        $pull: {
          comments: req.params.comment_id,
        },
      },
      function (err, doc) {
        if (!err)
          repliesModel.deleteMany(
            { comment: { $in: req.params.comment_id } },
            function (err, numberAffected) {
              if (!err)
                comment.delete({ _id: req.params.comment_id }, function (err) {
                  if (!err)
                    return res.json({
                      status: true,
                      message: "comment deleted",
                    });
                });
            }
          );
      }
    );
  } catch (err) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

router.patch("/reply/delete/:reply_id", auth, async (req, res) => {
  try {
    const reply = await repliesModel.findById(req.params.reply);
    if (!reply) return res.json({ status: false, message: "No reply found" });

    const Comment = await Post.findById(reply.comment);
    if (!Comment)
      return res.json({ status: false, message: "No Comment found" });

    await CommentModel.findOneAndUpdate(
      { _id: reply.comment },
      {
        $set: {
          replyCount: Comment.replyCount - 1,
        },
        $pull: {
          replies: req.params.reply_id,
        },
      },
      function (err, doc) {
        if (!err)
          repliesModel.delete({ _id: req.params.reply_id }, function (err) {
            if (!err)
              return res.json({
                status: true,
                message: "reply deleted",
              });
          });
      }
    );
  } catch (err) {
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

router.patch("/delete/:postId", auth, async (req, res) => {
  try {
    const postDet = await Post.findById(req.params.postId);
    console.log(postDet.alumni, req.user.user.id);
    if (!(postDet.alumni.toString() === req.user.user.id.toString()))
      return res.json({
        status: false,
        message: "Post not or no auth to delete found",
      });
    const alumniData = await Alumni.findOne({
      _id: req.user.user.id,
      status: true,
    });
    alumniData.posts.shift(req.params.postId);
    alumniData.postcount = alumniData.posts.length;
    alumniData.save();
    await CommentModel.deleteMany({ post: req.params.postId });
    await likesModel.deleteMany({ post: req.params.postId });
    await repliesModel.deleteMany({ post: req.params.postId });
    postDet.remove({ _id: req.params.postId }, function (err) {
      if (!err)
        return res.json({
          status: true,
          message: "Post Deleted",
        });
    });
  } catch (err) {
    console.log(err);
    res.json({ status: false, message: "Something happens worng" });
  }
});

router.patch("/:postId", auth, async (req, res) => {
  console.log(req.params.postId);
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.json({ status: false, message: "No post found" });

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
