const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addOnSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },

    title: {
      type: String,
    },
    MediaUrl: {
      type: String,
    },
    details: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("addons", addOnSchema);
