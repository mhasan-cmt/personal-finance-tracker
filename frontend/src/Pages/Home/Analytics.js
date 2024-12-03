import React, {useEffect, useState} from "react";
import axios from "axios";
import {Container, Row} from "react-bootstrap";
import {Pie, Line} from "react-chartjs-2";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {getCategories} from "../../utils/ApiRequest";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,LinearScale, PointElement, LineElement} from "chart.js";
import moment from "moment";

ChartJS.register(ArcElement, Tooltip, Legend,CategoryScale, LinearScale, PointElement, LineElement);

const Analytics = ({transactions, user}) => {
    const TotalTransactions = transactions.length;

    const totalIncomeTransactions = transactions.filter(
        (item) => item.transactionType === "credit"
    );
    const totalExpenseTransactions = transactions.filter(
        (item) => item.transactionType === "expense"
    );

    const totalIncome = totalIncomeTransactions.reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = totalExpenseTransactions.reduce((acc, item) => acc + item.amount, 0);
    const currentBalance = totalIncome - totalExpense;

    const [categories, setCategories] = useState([]);
    const [expenseData, setExpenseData] = useState({});
    const [dailyExpenseData, setDailyExpenseData] = useState({});

    useEffect(() => {
        const dailyTotals = {};

        totalExpenseTransactions.forEach((transaction) => {
            console.log(transaction)
            const date = moment(transaction.date).format("YYYY-MM-DD");
            dailyTotals[date] = (dailyTotals[date] || 0) + transaction.amount;
        });

        setDailyExpenseData({
            labels: Object.keys(dailyTotals),
            datasets: [
                {
                    label: "Daily Expenses",
                    data: Object.values(dailyTotals),
                    borderColor: "rgba(75,192,192,1)",
                    fill: false,
                },
            ],
        });
    }, [transactions]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data} = await axios.get(getCategories, {
                    params: {user: user._id}
                });
                setCategories(data.length === 0 ? ["Unassigned"] : data.categories || ["Unassigned"]);
            } catch (err) {
                setCategories(["Unassigned"]);
            }
        };

        fetchCategories();
    }, [user]);

    useEffect(() => {
        if (categories.length === 0) return;

        const categoryTotals = {};

        totalExpenseTransactions.forEach((transaction) => {

            const category = (categories.find(cat => cat.name === transaction.category.name) || {name: "Unassigned"}).name;
            categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
        });

        setExpenseData({
            labels: Object.keys(categoryTotals),
            datasets: [
                {
                    label: "Expenses by Category",
                    data: Object.values(categoryTotals),
                    backgroundColor: Object.keys(categoryTotals).map(
                        () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    ),
                },
            ],
        });
    }, [transactions, categories]);

    if (transactions.length === 0) {
        return (
            <Container className="mt-5">
                <Row>
                    <div
                        className="col-lg-3 col-md-6 offset-4 mb-4 d-flex align-items-center justify-content-center">
                        <div className="alert alert-warning text-center" role="alert">
                            <strong>No Transactions Found</strong>
                        </div>
                    </div>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <AttachMoneyIcon className="me-2"/>
                            <div>
                                <h5 className="card-title">Current Balance</h5>
                                <p className="card-text">${currentBalance.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <ArrowDropUpIcon className="me-2 text-success"/>
                            <div>
                                <h5 className="card-title">Total Income</h5>
                                <p className="card-text">${totalIncome.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body d-flex align-items-center">
                            <ArrowDropDownIcon className="me-2 text-danger"/>
                            <div>
                                <h5 className="card-title">Total Expense</h5>
                                <p className="card-text">${totalExpense.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Row>
            <Row>
                <div className="col-md-4 mt-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="text-center">Expenses by Category</h5>
                            {expenseData.labels && (
                                <Pie data={expenseData}/>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-8 mt-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="text-center">Daily Expenses</h5>
                            {dailyExpenseData.labels && (
                                <Line data={dailyExpenseData}/>
                            )}
                        </div>
                    </div>
                </div>
            </Row>
        </Container>
    );
};

export default Analytics;
