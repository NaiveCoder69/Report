import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Spinner,
  Button,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import API from "../api"; // api.js placed directly under src
import { AuthContext } from "../contexts/AuthContext";
import "../styles/projectDetails.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectRes, materialRes, expenseRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/material-deliveries?project=${id}`),
        API.get(`/expenses?project=${id}`),
      ]);

      setProject(projectRes.data || null);
      setMaterials(Array.isArray(materialRes.data) ? materialRes.data : []);
      setExpenses(Array.isArray(expenseRes.data) ? expenseRes.data : []);
    } catch (err) {
      console.error("Error loading project details:", err);
      setProject(null);
      setMaterials([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      setMembersLoading(true);
      const res = await API.get(`/projects/${id}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading project members:", err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const removeMember = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user from project?"
      )
    )
      return;
    try {
      await API.delete(`/projects/${id}/members/${userId}`);
      fetchProjectMembers();
    } catch (err) {
      console.error("Error removing member:", err);
      alert("Could not remove member.");
    }
  };

  if (loading) {
    return (
      <div className="project-shell">
        <div className="project-box project-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-shell">
        <div className="project-box project-center text-danger">
          ❌ Project not found or deleted
        </div>
      </div>
    );
  }

  // Totals
  const totalMaterialCost = (materials || []).reduce((sum, m) => {
    const base =
      m.totalAmount != null ? m.totalAmount : m.quantity * m.rate;
    return sum + (base || 0);
  }, 0);

  const totalExpense = (expenses || []).reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const canManageMembers = user && user.role === "Admin";

  return (
    <div className="project-shell">
      <div className="project-box">
        {/* Header */}
        <div className="project-header d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="project-badge">
              <div className="project-brand">PNK Construction</div>
              <div className="project-present">project details</div>
            </div>
            <h2 className="project-title">🏗️ {project.name}</h2>
            <p className="project-subtitle">
              Material, expenses and members for this project.
            </p>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            ← Back to Projects
          </Button>
        </div>

        {/* Summary */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm border-0 project-card">
              <Card.Body>
                <Card.Title className="fw-semibold text-secondary">
                  Total material cost
                </Card.Title>
                <h4 className="fw-bold text-success">
                  ₹{totalMaterialCost.toLocaleString()}
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm border-0 project-card">
              <Card.Body>
                <Card.Title className="fw-semibold text-secondary">
                  Total expenses
                </Card.Title>
                <h4 className="fw-bold text-danger">
                  ₹{totalExpense.toLocaleString()}
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Material Deliveries */}
        <Card className="mb-4 shadow-sm border-0 project-card">
          <Card.Header className="bg-primary text-white fw-bold">
            Material Deliveries
          </Card.Header>
          <Card.Body>
            {(materials || []).length > 0 ? (
              <Table
                bordered
                hover
                responsive
                className="align-middle project-table"
              >
                <thead className="table-light">
                  <tr>
                    <th>Material</th>
                    <th>Vendor</th>
                    <th>Quantity</th>
                    <th>Rate (₹)</th>
                    <th>Total Amount (₹)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(materials || []).map((m) => (
                    <tr key={m._id}>
                      <td>{m.material?.name || "-"}</td>
                      <td>{m.vendor?.name || "-"}</td>
                      <td>{m.quantity}</td>
                      <td>{m.rate}</td>
                      <td>
                        {(
                          m.totalAmount != null
                            ? m.totalAmount
                            : m.quantity * m.rate
                        ).toLocaleString()}
                      </td>
                      <td>{new Date(m.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted text-center mb-0">
                No material deliveries found for this project.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Expenses */}
        <Card className="mb-5 shadow-sm border-0 project-card">
          <Card.Header className="bg-danger text-white fw-bold">
            Project Expenses
          </Card.Header>
          <Card.Body>
            {(expenses || []).length > 0 ? (
              <Table
                bordered
                hover
                responsive
                className="align-middle project-table"
              >
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount (₹)</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(expenses || []).map((e) => (
                    <tr key={e._id}>
                      <td>{e.description}</td>
                      <td>{e.category || "-"}</td>
                      <td>{e.amount}</td>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>{e.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted text-center mb-0">
                No expenses recorded for this project.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Members (Admin only) */}
        {canManageMembers && (
          <Card className="mb-3 shadow-sm border-0 project-card">
            <Card.Header className="bg-info text-white fw-bold">
              Project Members
            </Card.Header>
            <Card.Body>
              {membersLoading ? (
                <Spinner animation="border" />
              ) : (members || []).length > 0 ? (
                <ListGroup>
                  {(members || []).map((member) => (
                    <ListGroup.Item
                      key={member._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{member.name}</strong> ({member.role})
                        <br />
                        <small>{member.email}</small>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeMember(member._id)}
                        title="Remove Member"
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="mb-0">No members found in this project.</p>
              )}
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
