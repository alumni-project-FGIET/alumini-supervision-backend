const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const citySchema = new Schema({
//   name: {
//     type: String,
//     required:true,
//     unique: true,
//   },
//   state: {
//     type: Schema.Types.ObjectId,
//     required:true,
//     ref: 'State'
//   }
// }, {
//   timestamps: true,
// });


// const City=module.exports = mongoose.model("City", citySchema);


const stateSchema = Schema({

  name: {
    type: String,
    required:true,
    unique: true,
  },
  country: [{ 
     type: Schema.Types.ObjectId,
     ref: 'Country' 
  }]
}, {
  timestamps: true,
});

const State=module.exports = mongoose.model("State", stateSchema);
