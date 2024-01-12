import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) =>{
    try{
        const DB_OPTIONS ={
            dbName :"project"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTIONS)
        console.log("Connection Successfully")
    }catch(error){
        console.log("error")
    }
}

export default connectDB