import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      const res = await API.post("/companies", { name });
      setSuccess(`Company '${res.data.name}' created successfully!`);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create company.");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 500 }}>
      <h2>Create a New Company</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter company name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100">
          Create Company
        </Button>
      </Form>
    </Container>
  );
}
