const mongoose = require("mongoose");
const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://tharunyetti24:Tharun%40123@cluster0.yzi6k.mongodb.net/ResumeAnalyser?retryWrites=true&w=majority&appName=Cluster0");
}
module.exports = connectDB;