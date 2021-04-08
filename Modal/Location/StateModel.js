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
  country:{},
  countryId: 
    {
      type: Schema.Types.ObjectId,
      ref: 'countries'
    }
  },
 {
  timestamps: true,
});

const State = mongoose.model("State", stateSchema);
module.exports = State