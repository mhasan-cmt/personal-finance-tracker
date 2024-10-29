import mongoose from "mongoose";

export const connectDB = async (req, res) => {

    const {connection} = await mongoose.connect("", { useNewUrlParser: true });

    console.log(`MongoDB Connected to ${connection.host}`);

}