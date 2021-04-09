const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = Schema(
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
    status: {
      type: Boolean,
    },
    password:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true
    },
    admin:{
      type:Boolean
   },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admins", adminSchema);
