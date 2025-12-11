import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import "../styles/joinRequestsAdmin.css";

const JoinRequestsAdmin = () => {
  const { refreshUserProfile } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const fetchRequests = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const res = await API.get("/join-requests");
      setRequests(res.data);
    } catch (err) {
      setStatusMessage("Failed to fetch join requests.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action, role = null) => {
    setActionLoading(id);
    setStatusMessage("");
    try {
      if (action === 'approve') {
        await API.post(`/join-requests/${id}/approve`, { role });
        setStatusMessage("User approved successfully!");
        setStatusType("success");
        await refreshUserProfile();
      } else {
        await API.post(`/join-requests/${id}/reject`);
        setStatusMessage("User rejected successfully!");
        setStatusType("success");
      }
      fetchRequests();
      
      // Auto-clear message after 3 seconds
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setStatusMessage("Action failed. Please try again.");
      setStatusType("error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="joinreq-shell">
      <div className="joinreq-box">
        {/* Header */}
        <div className="joinreq-header">
          <div className="joinreq-badge">
            <div className="joinreq-brand">PNK Constrction</div>
            <div className="joinreq-present">join requests</div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="joinreq-title">Pending Join Requests</h3>
              <p className="joinreq-subtitle">
                Review and approve new team members for your company.
              </p>
            </div>
            <div className="joinreq-refresh">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={fetchRequests}
                disabled={loading}
                className="joinreq-refresh-btn"
              >
                {loading ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className={`joinreq-status-banner ${statusType === "error" ? "joinreq-status-error" : "joinreq-status-success"}`}>
            {statusMessage}
          </div>
        )}

        <Container fluid className="px-0">
          {loading ? (
            <div className="joinreq-loading">
              <Spinner animation="border" className="me-3" />
              <span>Loading join requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="joinreq-empty">
              <div className="joinreq-empty-icon">📋</div>
              <h5 className="joinreq-empty-title">No pending requests</h5>
              <p className="joinreq-empty-subtitle">
                All team members are up to date. New requests will appear here.
              </p>
            </div>
          ) : (
            <div className="joinreq-table-card">
              <div className="joinreq-table-wrapper">
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className="joinreq-table mb-0"
                >
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Requested Role</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td className="joinreq-user-name">
                          <div className="joinreq-avatar">
                            {r.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{r.user.name}</span>
                        </td>
                        <td>{r.user.email}</td>
                        <td>
                          <select
                            className="joinreq-role-select"
                            defaultValue="Engineer"
                            id={`role-select-${r._id}`}
                            disabled={actionLoading === r._id}
                          >
                            <option value="Engineer">Engineer</option>
                            <option value="Admin">Admin</option>
                            <option value="Accountant">Accountant</option>
                          </select>
                        </td>
                        <td>
                          <span className="joinreq-date">
                            {new Date(r.requestedAt).toLocaleDateString('en-IN')} 
                            <br />
                            <small>{new Date(r.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                          </span>
                        </td>
                        <td>
                          <div className="joinreq-actions">
                            <Button
                              variant="success"
                              size="sm"
                              className="joinreq-approve-btn me-2"
                              disabled={actionLoading === r._id}
                              onClick={() => {
                                const selectEl = document.getElementById(`role-select-${r._id}`);
                                handleAction(r._id, 'approve', selectEl.value);
                              }}
                            >
                              {actionLoading === r._id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                'Approve'
                              )}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="joinreq-reject-btn"
                              disabled={actionLoading === r._id}
                              onClick={() => handleAction(r._id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default JoinRequestsAdmin;
