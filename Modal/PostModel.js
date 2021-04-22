const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectID,
      ref: "users",
    },
    title: {
      type: String,
    },
    discription: {
      type: String,
    },
    status: {
      type: Boolean,
    },
    mediUrl: {
      type: String,
    },
    likes: [
      {
        user: {
          type: Schema.Types.ObjectID,
          ref: "users",
        },
        count: {
          type: Number,
        },
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectID,
          ref: "users",
        },
        replies: [
          {
            user: {
              type: Schema.Types.ObjectID,
              ref: "users",
            },
            text: {
              type: String,
              required: true,
            },
            name: {
              type: String,
            },
            avatar: {
              type: String,
            },
            date: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        text: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("posts", postSchema);
