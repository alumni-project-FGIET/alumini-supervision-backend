const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addOnSchema = Schema(
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
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
    password: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    MediaUrl: {
      type: String,
    },
    admin: {
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

module.exports = mongoose.model("addons", addOnSchema);
