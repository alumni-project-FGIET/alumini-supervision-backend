const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeschema = Schema(
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
    count: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("likes", likeschema);
