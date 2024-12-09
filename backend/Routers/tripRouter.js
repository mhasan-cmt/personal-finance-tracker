import express from "express";
import {createTrip, deleteTrip, getTripById, getTrips, updateTrip} from "../controllers/TripController.js";

const router = express.Router();

router.route('/').post(createTrip).get(getTrips);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);

export default router;