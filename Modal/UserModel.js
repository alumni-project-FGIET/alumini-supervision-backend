const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "events",
      },
    ],
    eventscount: {
      type: Number,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    MediaUrl: {
      type: String,
    },
    college: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "colleges",
    },
    rollNo: {
      type: String,
      required: true,
    },
    verifyToken: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
    alumni: {
      type: Boolean,
    },
    friendList: [
      {
        friend: { type: Schema.Types.ObjectId, ref: "friends" },
        firstName: {
          type: String,
        },
        lastName: {
          type: String,
        },
        MediaUrl: {
          type: String,
        },
        college: {
          type: String,
        },
      },
    ],
    totalFriend: {
      type: Number,
    },
    friendCount: {
      type: Number,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
