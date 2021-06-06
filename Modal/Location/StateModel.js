const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const stateSchema = Schema({
  name: {
    type: String,
    required:true,
    unique: true,
  },
  sortname: {
    type: String
  },
  status:{
    type:Boolean,
  },
  country: 
    {
      type: Schema.Types.ObjectId,
      ref: 'countries',
      required:true
    }
  },
 {
  timestamps: true,
 }
);

const State = mongoose.model("states", stateSchema);
module.exports = State