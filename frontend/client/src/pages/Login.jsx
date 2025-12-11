import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);              // just log in
      navigate("/dashboard", { replace: true }); // always go to dashboard
    } catch (error) {
      setErr(error?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-box">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-left-badge">
            <div className="auth-left-brand">PNK Construction</div>
            <div className="auth-left-present">presents</div>
          </div>
          <div className="auth-left-title">Welcome back</div>
          <div className="auth-left-sub">
            Login to keep every project, site and vendor in sync.
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>See live status of all active projects in one place.</div>
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>Review material deliveries, bills and expenses quickly.</div>
          </div>
          <div className="auth-left-item">
            <span>●</span>
            <div>Give engineers and accountants exactly the access they need.</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="mb-3">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 auth-button"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </Button>
          </Form>

          <div className="auth-footer-text">
            New here?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
