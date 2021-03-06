const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema(
  {
    alumni: {
      type: Schema.Types.ObjectId,
      ref: "alumnis",
    },
    title: {
      type: String,
    },

    likesUser: [
      {
        type: Schema.Types.ObjectId,
        ref: "likes",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comments",
      },
    ],

    likeCount: {
      type: Number,
    },
    commentCount: {
      type: Number,
    },
    discription: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    MediaUrl: [
      {
        url: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("posts", postSchema);
