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
    phoneNo: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
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
    jobs: [
      {
        text: String,
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
        },
        yearOfExperienc: {
          type: Number,
        },
        jobTitle: {
          type: String,
          required: true,
        },
        jobCompany: {
          type: String,
          required: true,
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

module.exports = mongoose.model("alumni", alumnischema);
