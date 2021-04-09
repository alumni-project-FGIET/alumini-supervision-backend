const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    college: {
      required: true,
      type: Schema.Types.ObjectId,
      ref:'colleges'
    },
    rollNo: {
      type: String,
      required: true,
    },
    password:{
      type: String,
      required: true,  
    },
    status: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
