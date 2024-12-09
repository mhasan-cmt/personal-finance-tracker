import mongoose from "mongoose";

const trip = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Trip name is required"],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    budget: {
        type: Number,
        default: 0,
    },
    costs: [{
        type: {
            name: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
        },

    }],
}, {
    timestamps: true,
});

const Trip = mongoose.model('Trip', trip);

export default Trip;