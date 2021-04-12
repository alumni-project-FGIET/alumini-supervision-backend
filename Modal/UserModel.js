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
      required: true,
    },
    verified:{
      type:Boolean
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
    verifyToken: {
      type: String,
    },
    password:{
      type: String,
      required: true,  
    },
    status: {
      type: Boolean,
    },
    resetPasswordToken:{
      type:String
    },
    resetPasswordExpires:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
