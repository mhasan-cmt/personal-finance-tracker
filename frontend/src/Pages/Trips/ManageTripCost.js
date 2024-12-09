import React, {useEffect, useState} from "react";
import {Button, Modal, Form, Container} from "react-bootstrap";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import "./ManageTripCost.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {useNavigate} from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import axios from "axios";
import {addTrip, getTrips, updateTrip} from "../../utils/ApiRequest";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ManageTripCost = () => {
    const [showAddTrip, setShowAddTrip] = useState(false);
    const [showEditCosts, setShowEditCosts] = useState(false);
    const [selectedTripIndex, setSelectedTripIndex] = useState(null);
    const [newTrip, setNewTrip] = useState({name: "", budget: "", startDate: "", endDate: ""});
    const navigate = useNavigate();
    const [cUser, setcUser] = useState();
    const [refresh, setRefresh] = useState(false);
    const [tripDetails, setTripDetails] = useState([]);
    const toastOptions = {
        position: "bottom-right",
        autoClose: 2000,
        theme: "dark",
    };

    useEffect(() => {
        const avatarFunc = async () => {
            if (localStorage.getItem("user")) {
                const user = JSON.parse(localStorage.getItem("user"));

                if (user.isAvatarImageSet === false || user.avatarImage === "") {
                    navigate("/setAvatar");
                }
                setcUser(user);
                setRefresh(true);
            } else {
                navigate("/login");
            }
        };
        avatarFunc();
    }, [navigate]);

    const handleChange = (e) => {
        setNewTrip({...newTrip, [e.target.name]: e.target.value, user: cUser._id});
    };

    useEffect(() => {
        if (cUser) {
            fetchTrips();
        }
    }, [cUser]);

    const fetchTrips = async () => {
        try {
            const {data} = await axios.get(getTrips, {
                params: {user: cUser._id}
            });
            setTripDetails(data.length === 0 ? [] : data.trips);
        } catch (err) {
            setTripDetails([]);
        }
    };


    const handleAddTrip = async (e) => {
        e.preventDefault();
        if (!newTrip.name || !newTrip.budget || !newTrip.startDate || !newTrip.endDate) {
            toast.error("Please fill in all fields", toastOptions);
            return;
        }
        try {
            const {data} = await axios.post(addTrip, newTrip);
            if (data.success) {
                toast.success(data.message, toastOptions);
                setNewTrip({name: "", budget: "", startDate: "", endDate: "", costs: []});
                await fetchTrips();
                setShowAddTrip(false);
            }
        } catch (err) {
            if (err.response.data.message) {
                toast.error(err.response.data.message, toastOptions);
            } else {
                toast.error("Error please Try again...", toastOptions);
            }
        }
    };

    const handleAddCost = async (costName, costAmount, tripIndex) => {
        const tripId = tripDetails[tripIndex]._id;

        try {
            const updatedTrip = {
                ...tripDetails[tripIndex],
                costs: [...tripDetails[tripIndex].costs, {name: costName, amount: costAmount}]
            };
            const {data} = await axios.put(`${updateTrip}/${tripId}`, updatedTrip);
            if (data.success) {
                toast.success("Cost added successfully", toastOptions);
                const updatedTripDetails = [...tripDetails];
                updatedTripDetails[tripIndex] = updatedTrip;
                setTripDetails(updatedTripDetails);
                setShowEditCosts(false);
            }
        } catch (err) {
            toast.error("Error adding cost, please try again", toastOptions);
        }
    };

    const handleShareTrip = (index) => {
        const trip = tripDetails[index];
        toast.success(`Shared details of "${trip.name}"`, toastOptions);
    };

    function setShowEditCost(show) {
        setShowEditCosts(show);
    }

    function setSelectedCostIndex(index) {
        setSelectedTripIndex(index);
    }

    function setEditCost(cost) {
        const updatedTrips = [...tripDetails];
        updatedTrips[selectedTripIndex].costs[cost] = cost;
        setTripDetails(updatedTrips);
    }

    function handleDeleteTrip(item) {
        console.log("")
    }

    return (
        <Container>
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Button variant="secondary" onClick={() => navigate("/")} className="me-3">
                        ← Home
                    </Button>
                    <h2 className="text-primary">Manage Trip Costs</h2>
                    <div>
                        <Button variant="primary" onClick={() => setShowAddTrip(true)} className="me-3">
                            Add Trip <LocalAirportIcon className="ms-2"/>
                        </Button>
                    </div>
                </div>

                <div className="row">
                    {tripDetails.length > 0 && tripDetails.map((trip, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="card-title">
                                            {trip.name} <LocalAirportIcon className="ms-2"/>
                                        </h5>
                                        <p className="card-text">
                                            <strong>Budget:</strong> ${trip.budget} <AttachMoneyIcon className="ms-2"
                                                                                                     style={{marginLeft: "5px"}}/>
                                            <br/>
                                            <strong>Start:</strong> {trip.startDate}
                                            <br/>
                                            <strong>End:</strong> {trip.endDate}
                                        </p>
                                        <table className="table table-sm" style={{
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            display: 'block',
                                        }}>
                                            <thead>
                                            <tr>
                                                <th>Cost Name</th>
                                                <th>Amount</th>
                                                <th>Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {trip.costs.map((cost, i) => (
                                                <tr key={i}>
                                                    <td>{cost.name}</td>
                                                    <td>${cost.amount}</td>
                                                    <td>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTripIndex(index);
                                                                setSelectedCostIndex(i);
                                                                setEditCost({name: cost.name, amount: cost.amount});
                                                                setShowEditCost(true);
                                                            }}
                                                        >
                                                            <EditIcon/>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3">

                                        <Button
                                            variant="info"
                                            className="me-2"
                                            onClick={() => {
                                                setSelectedTripIndex(index);
                                                setShowEditCosts(true);
                                            }}
                                        >
                                            <AddCircleIcon/>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="mx-2"
                                            onClick={() => handleDeleteTrip(index)}
                                        >
                                            <DeleteForeverIcon/>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleShareTrip(index)}
                                        >
                                            Share <ShareIcon/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Add Trip Modal */}
            <Modal show={showAddTrip} onHide={() => setShowAddTrip(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Trip</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Trip Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Enter trip name"
                                value={newTrip.name}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control
                                type="number"
                                name="budget"
                                placeholder="Enter trip budget"
                                value={newTrip.budget}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="startDate"
                                value={newTrip.startDate}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="endDate"
                                value={newTrip.endDate}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddTrip(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddTrip}>
                        Add Trip
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Manage Costs Modal */}
            <Modal show={showEditCosts} onHide={() => setShowEditCosts(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Costs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const costName = e.target.costName.value;
                            const costAmount = e.target.costAmount.value;
                            handleAddCost(costName, costAmount, selectedTripIndex);
                            e.target.reset();
                        }}
                    >
                        <Form.Group className="mb-3">
                            <Form.Label>Cost Name</Form.Label>
                            <Form.Control type="text" name="costName" placeholder="E.g., Flight, Hotel"/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cost Amount</Form.Label>
                            <Form.Control type="number" name="costAmount" placeholder="Enter cost amount"/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Add Cost
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <ToastContainer/>
        </Container>
    );
};

export default ManageTripCost;
