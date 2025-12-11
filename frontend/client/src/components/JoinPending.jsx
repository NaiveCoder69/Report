import React from "react";
import { Container, Spinner } from "react-bootstrap";
import "../styles/joinPending.css";

const JoinPending = () => {
  return (
    <div className="pending-shell">
      <div className="pending-box">
        {/* Header */}
        <div className="pending-header">
          <div className="pending-badge">
            <div className="pending-brand">PNK Constrction</div>
            <div className="pending-present">pending approval</div>
          </div>
          <h3 className="pending-title">Join Request Pending</h3>
          <p className="pending-subtitle">
            Your request has been submitted and is awaiting company administrator approval.
          </p>
        </div>

        <Container fluid className="px-0">
          <div className="pending-content">
            {/* Animated spinner */}
            <div className="pending-spinner-wrapper">
              <div className="pending-spinner">
                <Spinner animation="border" className="pending-spinner-icon" />
                <div className="pending-spinner-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>

            <div className="pending-message">
              <h4 className="pending-main-text">Waiting for Admin Approval</h4>
              <p className="pending-subtext">
                Company administrators will review your request shortly. 
                You'll receive a notification once approved.
              </p>
            </div>

            <div className="pending-status">
              <div className="pending-status-item pending-active">
                <div className="pending-status-circle"></div>
                <span>Submitted</span>
              </div>
              <div className="pending-status-line"></div>
              <div className="pending-status-item">
                <div className="pending-status-circle pending-waiting"></div>
                <span>Approved</span>
              </div>
            </div>

            <div className="pending-hint">
              <div className="pending-hint-icon">💡</div>
              <p>You can close this tab. You'll be notified when approved.</p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default JoinPending;
