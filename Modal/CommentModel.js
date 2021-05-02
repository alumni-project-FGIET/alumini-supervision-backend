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
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "replies",
      },
    ],
    text: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comments", commentSchema);
