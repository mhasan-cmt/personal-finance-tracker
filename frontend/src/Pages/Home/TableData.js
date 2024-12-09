import React, {useEffect, useState} from "react";
import {Button, Container, Form, Modal, Table} from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";
import {deleteTransactions, editTransactions, getCategories} from "../../utils/ApiRequest";
import axios from "axios";
import * as XLSX from "xlsx";
import AssessmentIcon from '@mui/icons-material/Assessment';

const TableData = (props) => {
    const [show, setShow] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [currId, setCurrId] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);

    const handleEditClick = (itemKey) => {
        console.log("Clicked button ID:", itemKey);
        if (transactions.length > 0) {
            const editTran = props.data.filter((item) => item._id === itemKey);
            setCurrId(itemKey);
            setEditingTransaction(editTran);
            handleShow();
        }
    };

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(transactions);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, XLSX.writeFile(workbook, `transactions_${user.email}_${moment().format('YYYYMMDD')}.xlsx`));
    };

    const fetchCategories = async () => {
        try {
            const {data} = await axios.get(getCategories, {
                params: {user: user._id}
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

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user]);

    const handleEditSubmit = async (e) => {
        const {data} = await axios.put(`${editTransactions}/${currId}`, {
            ...values,
        });

        if (data.success === true) {

            await handleClose();
            await setRefresh(!refresh);
            window.location.reload();
        } else {
            console.log("error");
        }

    }

    const handleDeleteClick = async (itemKey) => {
        console.log(user._id);
        console.log("Clicked button ID delete:", itemKey);
        setCurrId(itemKey);
        const {data} = await axios.post(`${deleteTransactions}/${itemKey}`, {
            userId: props.user._id,
        });

        if (data.success === true) {
            await setRefresh(!refresh);
            window.location.reload();
        } else {
            console.log("error");
        }

    };

    const [values, setValues] = useState({
        title: "", amount: "", description: "", category: "", date: "", transactionType: "",
    });

    const handleChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value});
    };

    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {
        setShow(true);
    };

    useEffect(() => {
        setUser(props.user);
        setTransactions(props.data);
    }, [props.data, props.user, refresh]);

    return (<>
        <Container>
            <Button onClick={handleDownloadExcel} className="downloadExcel my-3" style={{marginRight: "10px"}}>
                Generate Report
                <AssessmentIcon className={"mx-2"}/>
            </Button>
            <Table responsive="md" className="data-table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody className="text-white">
                {props.data.map((item, index) => (<tr key={index}>
                    <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                    <td>{item.title}</td>
                    <td>{item.amount}</td>
                    <td>{item.transactionType}</td>
                    <td>{item.category.name}</td>
                    <td>
                        <div className="icons-handle">
                            <EditNoteIcon
                                sx={{cursor: "pointer"}}
                                key={item._id}
                                id={item._id}
                                onClick={() => handleEditClick(item._id)}
                            />

                            <DeleteForeverIcon
                                sx={{color: "red", cursor: "pointer"}}
                                key={index}
                                id={item._id}
                                onClick={() => handleDeleteClick(item._id)}
                            />

                            {editingTransaction ? (<>
                                <div>
                                    <Modal show={show} onHide={handleClose} centered>
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                Update Transaction Details
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form onSubmit={handleEditSubmit}>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formName"
                                                >
                                                    <Form.Label>Title</Form.Label>
                                                    <Form.Control
                                                        name="title"
                                                        type="text"
                                                        placeholder={editingTransaction[0].title}
                                                        value={values.title || editingTransaction[0].title}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formAmount"
                                                >
                                                    <Form.Label>Amount</Form.Label>
                                                    <Form.Control
                                                        name="amount"
                                                        type="number"
                                                        placeholder={editingTransaction[0].amount}
                                                        value={values.amount || editingTransaction[0].amount}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSelect"
                                                >
                                                    <Form.Label>Category</Form.Label>
                                                    <Form.Select
                                                        name="category"
                                                        value={values.category || editingTransaction[0].category._id}
                                                        onChange={handleChange}
                                                    >
                                                        {categories.map((category) => (
                                                            <option key={category._id} value={category._id}>
                                                                {category.name}
                                                            </option>))}
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formDescription"
                                                >
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="description"
                                                        placeholder={editingTransaction[0].description}
                                                        value={values.description || editingTransaction[0].description}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>

                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSelect1"
                                                >
                                                    <Form.Label>Transaction Type</Form.Label>
                                                    <Form.Select
                                                        name="transactionType"
                                                        value={values.transactionType}
                                                        onChange={handleChange}
                                                    >
                                                        <option
                                                            value={editingTransaction[0].transactionType}>{editingTransaction[0].transactionType}</option>
                                                        <option value="Credit">Credit</option>
                                                        <option value="Expense">Expense</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formDate"
                                                >
                                                    <Form.Label>Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="date"
                                                        value={values.date ? moment(values.date).format("YYYY-MM-DD") : moment(editingTransaction[0].date).format("YYYY-MM-DD")}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={handleClose}>
                                                Close
                                            </Button>
                                            <Button variant="primary" type="submit"
                                                    onClick={handleEditSubmit}>Submit</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </div>
                            </>) : (<></>)}
                        </div>
                    </td>
                </tr>))}
                </tbody>
            </Table>
        </Container>
    </>);
};

export default TableData;
