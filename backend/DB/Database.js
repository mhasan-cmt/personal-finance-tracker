import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
export const connectDB = async (req, res) => {
    const {connection} = await mongoose.connect(
        process.env.MONGO_URL,
        {useNewUrlParser: true}
    );

    console.log(`MongoDB Connected to ${connection.host}`);
};
