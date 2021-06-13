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
