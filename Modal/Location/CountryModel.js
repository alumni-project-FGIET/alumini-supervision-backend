const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const State=require('./StateModel')


const countrySchema = new Schema({ 
    sortname: {
      type: String,
    },
    name: {
      type: String,
      required:true,
      unique: true,
    },
    states: [
        {
          type: Schema.Types.ObjectId,
          ref: 'State'
        }]
  }, {
    timestamps: true,
  });
  
const Country = module.exports = mongoose.model("Country", countrySchema);
  