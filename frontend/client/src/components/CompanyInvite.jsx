import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import API from "../api";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import "../styles/companyInvite.css";

const CompanyInvite = () => {
  const { user } = useContext(AuthContext);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  // Helper to check if invite expired
  const isExpired = company && company.inviteExpiresAt && 
    new Date(company.inviteExpiresAt) < new Date();

  useEffect(() => {
    if (isExpired && !generating && user && user.company) {
      const timeout = setTimeout(() => {
        handleGenerateInvite();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isExpired, generating, user]);

  const fetchCompany = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const companyId = typeof user.company === "string" ? user.company : user.company._id;
      const res = await API.get(`/companies/${companyId}`);
      setCompany(res.data);
    } catch (err) {
      setStatusMessage("Failed to load company information.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setGenerating(true);
    setStatusMessage("");
    try {
      const res = await API.post("/companies/invite");
      setCompany(prev => ({
        ...prev,
        inviteToken: res.data.inviteToken,
        inviteExpiresAt: res.data.inviteExpiresAt
      }));
      setStatusMessage("New invite link generated successfully!");
      setStatusType("success");
    } catch (err) {
      setStatusMessage("Failed to generate invite link.");
      setStatusType("error");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (user && user.company) {
      fetchCompany();
    }
  }, [user]);

  const inviteLink = company?.inviteToken
    ? `${window.location.origin}/join-company?token=${company.inviteToken}`
    : "";

  return (
    <div className="invite-shell">
      <div className="invite-box">
        {/* Header */}
        <div className="invite-header">
          <div className="invite-badge">
            <div className="invite-brand">PNK Constrction</div>
            <div className="invite-present">company invite</div>
          </div>
          <h3 className="invite-title">Invite Team Members</h3>
          <p className="invite-subtitle">
            Share this secure link with your team to join your company dashboard.
          </p>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className={`invite-status-banner ${statusType === "error" ? "invite-status-error" : "invite-status-success"}`}>
            {statusMessage}
          </div>
        )}

        <Container fluid className="px-0">
          {loading ? (
            <div className="invite-loading">
              <Spinner animation="border" className="me-2" />
              <span>Loading company details...</span>
            </div>
          ) : company ? (
            <div className="invite-card">
              <div className="invite-section">
                <h5 className="invite-section-title">Company Details</h5>
                <div className="invite-info-grid">
                  <div className="invite-info-item">
                    <label>Company Code</label>
                    <div className="invite-info-value">
                      {company.inviteCode || <span className="invite-missing">Not set</span>}
                    </div>
                  </div>
                  <div className="invite-info-item">
                    <label>Invite Link</label>
                    <div className="invite-info-value invite-link">
                      {inviteLink ? (
                        <a href={inviteLink} target="_blank" rel="noopener noreferrer" className="invite-link-text">
                          {inviteLink}
                        </a>
                      ) : (
                        <span className="invite-missing">Not available</span>
                      )}
                    </div>
                  </div>
                  <div className="invite-info-item">
                    <label>Expiry Date</label>
                    <div className="invite-info-value">
                      {company.inviteExpiresAt
                        ? new Date(company.inviteExpiresAt).toLocaleString('en-IN')
                        : <span className="invite-missing">Not set</span>}
                      {isExpired && <span className="invite-expired-badge">EXPIRED</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              {(isExpired || !company.inviteToken) && (
                <div className="invite-action-section">
                  <Button
                    variant="primary"
                    onClick={handleGenerateInvite}
                    disabled={generating}
                    className="invite-generate-btn"
                  >
                    {generating ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      "Generate New Invite Link"
                    )}
                  </Button>
                  <p className="invite-action-note">
                    Link expires in 7 days. Generate new one anytime.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="invite-empty">
              <h5>No company found</h5>
              <p className="text-muted">Please create or join a company first.</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default CompanyInvite;
