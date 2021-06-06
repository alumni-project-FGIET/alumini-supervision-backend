const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const countrySchema = new Schema(
  {
    sortname: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.model("countries", countrySchema);
module.exports = Country;
