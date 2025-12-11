import React, { useState } from "react";
import API from "../api";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import "../styles/joinCompanyForm.css";

const JoinCompanyForm = () => {
  const [formData, setFormData] = useState({ code: "", token: "" });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const handleChange = (e) => {
    let { name, value } = e.target;
    // If the user enters a full URL, extract token from it
    if (name === "token" && value.includes("token=")) {
      const match = value.match(/token=([A-Za-z0-9]+)/);
      value = match ? match[1] : value;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code && !formData.token) {
      setStatusMessage("Please enter the 6-digit code OR invitation link token.");
      setStatusType("error");
      return;
    }
    setStatusMessage("");
    setLoading(true);

    try {
      const res = await API.post("/join-requests", formData);
      setStatusMessage(res.data.message || "Join request submitted successfully!");
      setStatusType("success");
      setFormData({ code: "", token: "" });
    } catch (err) {
      setStatusMessage(err.response?.data?.message || "Failed to submit join request.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="joinform-shell">
      <div className="joinform-box">
        {/* Header */}
        <div className="joinform-header">
          <div className="joinform-badge">
            <div className="joinform-brand">PNK Constrction</div>
            <div className="joinform-present">join company</div>
          </div>
          <h3 className="joinform-title">Join Company</h3>
          <p className="joinform-subtitle">
            Enter invite code or paste invitation link to request access.
          </p>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className={`joinform-status-banner ${statusType === "error" ? "joinform-status-error" : "joinform-status-success"}`}>
            {statusMessage}
          </div>
        )}

        <Container fluid className="px-0">
          <Form onSubmit={handleSubmit} className="joinform-card">
            {/* Invite Code */}
            <Form.Group className="joinform-group">
              <Form.Label className="joinform-label">
                6-Digit Invite Code
              </Form.Label>
              <Form.Control 
                type="text" 
                name="code" 
                maxLength={6} 
                value={formData.code} 
                onChange={handleChange}
                className="joinform-control"
                placeholder="ABC123"
              />
              <Form.Text className="joinform-hint">
                Enter the 6-character code shared by company admin.
              </Form.Text>
            </Form.Group>

            {/* OR Divider */}
            <div className="joinform-divider">
              <span className="joinform-divider-text">OR</span>
            </div>

            {/* Invite Token */}
            <Form.Group className="joinform-group">
              <Form.Label className="joinform-label">
                Invitation Link Token
              </Form.Label>
              <Form.Control 
                type="text" 
                name="token" 
                value={formData.token} 
                onChange={handleChange}
                className="joinform-control"
                placeholder="Paste full link or token only"
              />
              <Form.Text className="joinform-hint">
                Paste the full invite link - token will be extracted automatically.
              </Form.Text>
            </Form.Group>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="joinform-submit-btn w-100"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing Request...
                </>
              ) : (
                'Submit Join Request'
              )}
            </Button>

            <div className="joinform-footer">
              <p className="joinform-note">
                Your request will be reviewed by company admin shortly.
              </p>
            </div>
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default JoinCompanyForm;
