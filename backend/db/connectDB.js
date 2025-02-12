import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Erro connection to MongoDB: ", error.message)
        process.exit(1) //1 status code means failure, 0 status code mean success
    }
   
}