import mongoose from "mongoose";
import validator from "validator";
// User Schema Model - (Name, email, password, creation Date) with validation rules
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: "Invalid email format"
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password Must Be Atleast 6 characters"],
    },
    isAvatarImageSet: {
        type: Boolean,
        default: false,
    },
    avatarImage: {
        type: String,
        default: ""
    },
    transactions: {
        type: [mongoose.Schema.Types.Mixed],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: [true, "Role is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default User;