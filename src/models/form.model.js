import mongoose, {Schema} from "mongoose";

const formSchema = new Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Name is required"]
    },
    number:{
        type:Number,
        unique:true,
        required:[true,"Phone number is required"]
    },
    email:{
        type:String,
        unique:true,
        required:[true,"Email is required"]
    },
    address:{
        type:String,
        required:[true,"Address is required"]
    },
    aadhar:{
        type:Number,
        unique:true,
        required:[true,"Aadhar is required"]
    },
    pass:{
        type:String,
        enums:["SSLC","PUC","Degree","Others"],
        required:[true,"Last passed level is required"]
    },
    year:{
        type:String,
        required:[true,"Year of passing is required"]
    }
},{timestamps:true});

export const Form = mongoose.models.Form || mongoose.model("Form",formSchema);