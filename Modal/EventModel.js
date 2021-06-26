const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = Schema(
  {
    title: {
      type: String,
    },
    eventCode: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    venue: {
      type: String,
    },
    date: {
      type: String
    },
    alumnis: {
      type: Schema.Types.ObjectId,
      ref: "alumnis",
    },
    users: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: Boolean,
    },
    MediaUrl: [
      {
        url: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("events", EventSchema);
