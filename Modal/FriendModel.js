const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendschema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
    },
    target: {
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
      MediaUrl: {
        type: String,
      },
    },
    connect: {
      type: Boolean,
    },
    blocked: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("friends", friendschema);
