import Trip from "../models/TripScheme.js";

export const createTrip = async (req, res) => {
    try {
        let trip = new Trip(req.body);
        await trip.save();
        res.status(201).json({
            success: true,
            message: "Trip created successfully",
        });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};

export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({user: req.query.user}).populate('user', 'name email');
        res.status(200).json({
            success: true,
            trips
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


export const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('user', 'name email');
        if (!trip) {
            return res.status(404).json({message: "Trip not found"});
        }
        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const updateTrip = async (req, res) => {
    try {

        const trip = await Trip.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true}
        );
        if (!trip) {
            return res.status(404).json({message: "Trip not found"});
        }
        res.status(200).json(trip);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};


export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) {
            return res.status(404).json({message: "Trip not found"});
        }
        res.status(200).json({message: "Trip deleted successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};