import mongoose from "mongoose";
import config from "./config.js";

const connectDb = async () => {
    await mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err)
    })
}

export default connectDb;