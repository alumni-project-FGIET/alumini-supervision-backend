const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    alumni: {
      type: Schema.Types.ObjectId,
      ref: "alumnis",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "replies",
      },
    ],

    replyCount: {
      type: Number,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comments", commentSchema);
