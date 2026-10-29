require("dotenv").config();
const mongoose = require("mongoose");

const connectDB=async()=>{
    const  MONGO_URI=process.env.MONGO_URI;
    if(!MONGO_URI){
        console.log("MONGO_URI is not defined in .env file");
        process.exit(1);
    }
    try{
        const conn=await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports=connectDB;