const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replieSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    alumni: {
      type: Schema.Types.ObjectId,
      ref: "alumnis",
    },
    reply: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("replies", replieSchema);
