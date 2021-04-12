const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const citySchema = new Schema({
  name: {
    type: String,
    required:true,
    unique: true,
  },
  state: 
    {
      type: Schema.Types.ObjectId,
      ref: 'states'
    }
},

{
  timestamps: true,
}
);



const City = mongoose.model("cities", citySchema);
module.exports = City