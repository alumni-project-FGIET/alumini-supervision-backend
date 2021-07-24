const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tandcchema = Schema(
  {
    status: {
      type: Boolean,
    },

    description: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("tandcs", tandcchema);
