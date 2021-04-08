const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const countrySchema = new Schema({ 
    sortname: {
      type: String,
    },
    name: {
      type: String,
      required:true,
      unique: true,
    },
    
  }, {
    timestamps: true,
  });
  
const Country  = mongoose.model("Country", countrySchema);
module.exports = Country
  