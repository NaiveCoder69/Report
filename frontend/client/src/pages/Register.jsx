import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import API from "../api";
import CompanyChoiceModal from "../components/CompanyChoiceModal";
import "../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [showCompanyChoice, setShowCompanyChoice] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);
      setMsg("Registration successful! Please choose how to continue.");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: ""
      });
      setShowCompanyChoice(true);
    } catch (error) {
      setErr(error.response?.data?.message || "Error registering user.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-box">
        {/* LEFT: company + points */}
        <div className="auth-left">
<div className="auth-left-badge">
  <div className="auth-left-brand">PNK Construction</div>
  <div className="auth-left-present">presents</div>
</div>
          <div className="auth-left-title">A new way to run projects</div>
          <div className="auth-left-sub">
            Your idea to centralise construction management is powerful. This
            account is the first step.
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>Connect all sites, vendors and labour to one system.</div>
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>See bills, deliveries and expenses without hunting in files.</div>
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>Invite family and team to collaborate securely.</div>
          </div>
        </div>

        {/* RIGHT: register form */}
        <div className="auth-right">
          <div className="mb-3">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">
              Tell us a few details so your dashboard is ready.
            </p>
          </div>

          {msg && <Alert variant="success">{msg}</Alert>}
          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full name *</Form.Label>
              <Form.Control
                className="auth-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="What is your name?"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                className="auth-input"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                className="auth-input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                className="auth-input"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm password *</Form.Label>
              <Form.Control
                type="password"
                className="auth-input"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                className="auth-input"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Site or office address (optional)"
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 auth-button"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Register"}
            </Button>
          </Form>

          <div className="auth-footer-text">
            Already registered?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </div>

          <CompanyChoiceModal
            show={showCompanyChoice}
            onCreate={() => {
              setShowCompanyChoice(false);
              navigate("/create-company");
            }}
            onJoin={() => {
              setShowCompanyChoice(false);
              navigate("/join-company");
            }}
          />
        </div>
      </div>
    </div>
  );
}
