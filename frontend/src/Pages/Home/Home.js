import React, {useEffect, useState} from "react";
import Header from "../../components/Header";
import {useNavigate} from "react-router-dom";
import {Button, Modal, Form, Container} from "react-bootstrap";
import "./home.css";
import {addTransaction, getTransactions, getCategories} from "../../utils/ApiRequest";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';
import CategoryIcon from '@mui/icons-material/Category';

const Home = () => {
    const navigate = useNavigate();

    const toastOptions = {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
    };
    const [cUser, setcUser] = useState();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [categories, setCategories] = useState([]);
    const [frequency, setFrequency] = useState("7");
    const [type, setType] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [view, setView] = useState("table");
    const [showCategory, setShowCategory] = useState(false);


    const handleStartChange = (date) => {
        setStartDate(date);
    };

    const handleEndChange = (date) => {
        setEndDate(date);
    };

    const fetchCategories = async () => {
        try {
            const {data} = await axios.get(getCategories, {
                params: {user: cUser._id}
            });
            setCategories(data.length === 0 ? ['Unassigned'] : data);
            if (data.length === 0) {
                setCategories(['Unassigned']);
            } else {
                setCategories(data.categories);
            }
        } catch (err) {
            setCategories(['Unassigned']);
        }
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleCloseCategory = () => setShowCategory(false);
    const handleShowCategory = () => setShowCategory(true);

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

    useEffect(() => {
        if (cUser) {
            fetchCategories();
        }
    }, [cUser]);

    const [values, setValues] = useState({
        title: "", amount: "", description: "", category: "Unassigned", date: "", transactionType: "",
    });

    const [categoryName, setCategoryName] = useState("");

    const handleChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    };

    const handleCategoryChange = (e) => {
        setCategoryName(e.target.value);
    };

    const handleChangeFrequency = (e) => {
        setFrequency(e.target.value);
    };

    const handleSetType = (e) => {
        setType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {title, amount, description, category, date, transactionType} = values;
        if (!title || !amount || !description || !category || !date || !transactionType) {
            toast.error("Please enter all the fields", toastOptions);
            return;
        }

        const {data} = await axios.post(addTransaction, {
            title: title,
            amount: amount,
            description: description,
            category: category,
            date: date,
            transactionType: transactionType,
            userId: cUser._id,
        });

        if (data.success === true) {
            toast.success(data.message, toastOptions);
            handleClose();
            setValues({
                title: "", amount: "", description: "", category: "", date: "", transactionType: "",
            });
            setRefresh(!refresh);
        } else {
            toast.error(data.message, toastOptions);
        }

    };

    const handleReset = () => {
        setType("all");
        setStartDate(null);
        setEndDate(null);
        setFrequency("7");
    };


    useEffect(() => {

        const fetchAllTransactions = async () => {
            try {
                const {data} = await axios.post(getTransactions, {
                    userId: cUser._id, frequency: frequency, startDate: startDate, endDate: endDate, type: type,
                });
                setTransactions(data.transactions);

            } catch (err) {
                toast.error("Error please Try again...", toastOptions);
            }
        };

        fetchAllTransactions();
    }, [refresh, frequency, categories, endDate, type, startDate, cUser?._id]);

    const handleTableClick = (e) => {
        setView("table");
    };

    const handleChartClick = (e) => {
        setView("chart");
    };
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!categoryName) {
            toast.error("Please enter a category name", toastOptions);
            return;
        }
        try {
            const {data} = await axios.post(getCategories, {name: categoryName, user: cUser});
            if (data.success) {
                toast.success(data.message, toastOptions);
                setCategoryName("");
                await fetchCategories();
            } else {
                toast.error(data.message, toastOptions);
            }
        } catch (err) {
            if (err.response.data.message) {
                toast.error(err.response.data.message, toastOptions);
            } else {
                toast.error("Error please Try again...", toastOptions);
            }
        }
    };


    return (<>
        <Header/>

        {loading ? (<>
            <Spinner/>
        </>) : (<>
            <Container
                style={{position: "relative", zIndex: "2 !important"}}
                className="mt-3"
            >
                <div className="filterRow">
                    <div className="text-white">
                        <Form.Group className="mb-3" controlId="formSelectFrequency">
                            <Form.Label>Select Frequency</Form.Label>
                            <Form.Select
                                name="frequency"
                                value={frequency}
                                onChange={handleChangeFrequency}
                            >
                                <option value="7">Last Week</option>
                                <option value="30">Last Month</option>
                                <option value="365">Last Year</option>
                                <option value="custom">Custom</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="text-white type">
                        <Form.Group className="mb-3" controlId="formSelectFrequency">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={type}
                                onChange={handleSetType}
                            >
                                <option value="all">All</option>
                                <option value="expense">Expense</option>
                                <option value="credit">Earned</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="text-white iconBtnBox">
                        <FormatListBulletedIcon
                            sx={{cursor: "pointer"}}
                            onClick={handleTableClick}
                            className={`${view === "table" ? "iconActive" : "iconDeactive"}`}
                        />
                        <BarChartIcon
                            sx={{cursor: "pointer"}}
                            onClick={handleChartClick}
                            className={`${view === "chart" ? "iconActive" : "iconDeactive"}`}
                        />
                    </div>

                    <div>
                        <Button onClick={handleShow} className="addNew" style={{marginRight: "10px"}}>
                            Trips
                            <LocalAirportIcon className={"ms-2"}/>
                        </Button>
                        <Button onClick={handleShow} className="addNew" style={{marginRight: "10px"}}>
                            Add New
                            <AddCircleIcon className={"ms-2"}/>
                        </Button>
                        <Button onClick={handleShowCategory} className="addCategory">
                            Add Category
                            <CategoryIcon className={"ms-2"}/>
                        </Button>
                        <Button onClick={handleShow} className="mobileBtn">
                            +
                        </Button>
                        <Modal show={show} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Add Transaction Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formName">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            name="title"
                                            type="text"
                                            placeholder="Enter Transaction Name"
                                            value={values.name}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAmount">
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            name="amount"
                                            type="number"
                                            placeholder="Enter your Amount"
                                            value={values.amount}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formSelect">
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={values.category || "Unassigned"}
                                            onChange={handleChange}
                                        >
                                            <option value="Unassigned">Unassigned</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>))}

                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formDescription">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="description"
                                            placeholder="Enter Description"
                                            value={values.description}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formSelect1">
                                        <Form.Label>Transaction Type</Form.Label>
                                        <Form.Select
                                            name="transactionType"
                                            value={values.transactionType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Choose...</option>
                                            <option value="credit">Credit</option>
                                            <option value="expense">Expense</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formDate">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={values.date}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>

                                    {/* Add more form inputs as needed */}
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <Modal show={showCategory} onHide={handleCloseCategory} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Add Category</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formCategoryName">
                                        <Form.Label>Category Name <span className='text-danger'>*</span></Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                name="categoryName"
                                                type="text"
                                                placeholder="Enter Category Name"
                                                value={categoryName}
                                                onChange={handleCategoryChange}
                                            />
                                            <Button variant="primary" onClick={handleCategorySubmit} className="ms-2">
                                                Submit
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </Form>
                                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                    <table className="table table-sm">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Category Name</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {categories.map((category, index) => (
                                            <tr key={category._id}>
                                                <td>{index + 1}</td>
                                                <td>{category.name}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseCategory}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
                <br style={{color: "white"}}></br>

                {frequency === "custom" ? (<>
                    <div className="date">
                        <div className="form-group">
                            <label htmlFor="startDate" className="text-white">
                                Start Date:
                            </label>
                            <div>
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleStartChange}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate" className="text-white">
                                End Date:
                            </label>
                            <div>
                                <DatePicker
                                    selected={endDate}
                                    onChange={handleEndChange}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                />
                            </div>
                        </div>
                    </div>
                </>) : (<></>)}

                <div className="containerBtn">
                    <Button variant="primary" onClick={handleReset}>
                        Reset Filter
                    </Button>
                </div>
                {view === "table" ? (<>

                    <TableData data={transactions} user={cUser}/>
                </>) : (<>
                    <Analytics transactions={transactions} user={cUser}/>
                </>)}
                <ToastContainer/>
            </Container>
        </>)}
    </>);
};

export default Home;
