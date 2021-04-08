const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const CollegeSchema= Schema({
        name:{
            type:String,
            required:true,
        },
        collegeCode:{type:String,
            required:true,
            unique:true
        },
        city:{},
        cityId: 
          {
            type: Schema.Types.ObjectId,
            ref: 'cities'
          },
        status:{
            type:Boolean,
        }
},{
    timestamps:true
})

module.exports = mongoose.model('College',CollegeSchema)