const mongoose=require('mongoose');

const CollegeSchema= mongoose.Schema({
        name:{
            type:String,
            required:true,
            unique:true
        },
        place:{
            type:String,
        },
        status:{
            type:Boolean,
        }
},{
    timestamps:true
})

module.exports = mongoose.model('College',CollegeSchema)