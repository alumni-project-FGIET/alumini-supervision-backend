const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new Schema(
  {
    name: {
      type: String,
      // required: true,
      unique: true,
    },
    status: {
      type: Boolean,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "states",
    },
  },

  {
    timestamps: true,
  }
);

const City = mongoose.model("cities", citySchema);
module.exports = City;
