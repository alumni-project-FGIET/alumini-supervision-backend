const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const alumnischema = Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    MediaUrl: {
      type: String,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "posts",
      },
    ],
    postcount: {
      type: Number,
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
    college: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "colleges",
    },

    rollNo: {
      type: String,
      required: true,
    },

    alumni: {
      type: Boolean,
    },

    totalFriend: {
      type: Number,
    },

    jobs: [
      {
        from: {
          type: Date,
        },
        to: {
          type: Date,
        },
        yearOfExperienc: {
          type: Number,
        },
        jobTitle: {
          type: String,
        },
        jobCompany: {
          type: String,
        },
        jobLocation: {
          type: Schema.Types.ObjectId,
          ref: "cities",
        },
      },
    ],

    jobProvider: {
      type: String,
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

module.exports = mongoose.model("alumnis", alumnischema);
