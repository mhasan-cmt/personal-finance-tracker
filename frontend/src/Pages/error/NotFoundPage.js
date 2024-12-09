import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import "./not-found-page.css";

const NotFoundPage = () => {
    const navigate = useNavigate();

    const goHome = () => {
        navigate("/");
    };

    return (
        <Container className="not-found-container text-center">
            <div className="not-found-content">
                <h1 className="not-found-title">404</h1>
                <p className="not-found-description">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <Button variant="primary" onClick={goHome}>
                    Go Back to Home
                </Button>
            </div>
        </Container>
    );
};

export default NotFoundPage;
