import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import CompanyChoiceModal from "../components/CompanyChoiceModal";
import { Card, Row, Col, Spinner, Table } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Show create/join popup whenever user has no company
  useEffect(() => {
    if (user && !user.company) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user]);

  // Load dashboard data only when user has a company
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get("/dashboard/project-summary");
        console.log("Dashboard API response:", response.data);

        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else if (Array.isArray(response.data.projects)) {
          setProjects(response.data.projects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (error.response) {
          console.error("Backend error response:", error.response.data);
          alert(`Dashboard error: ${error.response.data.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.company) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateCompany = () => {
    setShowModal(false);
    navigate("/create-company");
  };

  const handleJoinCompany = () => {
    setShowModal(false);
    navigate("/join-company");
  };

  if (loading) {
    return (
      <div className="dash-shell">
        <div className="dash-loading">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dash-shell">
        <div className="dash-box">
          {/* HEADER */}
          <div className="dash-header">
            <div>
              <div className="dash-badge">
                <div className="dash-brand">PNK Construction</div>
                <div className="dash-present">project overview</div>
              </div>
              <h2 className="dash-title">Dashboard</h2>
              <p className="dash-subtitle">
                Quick snapshot of material, expense and labour spending across your projects.
              </p>
            </div>
          </div>

          {(!user?.company || projects.length === 0) ? (
            <Card className="dash-empty-card">
              <h5>No project data available</h5>
              <p className="text-muted mb-0">
                Add materials, expenses or labour payments to see project details here.
              </p>
            </Card>
          ) : (
            <>
              {/* SUMMARY CARDS */}
              <Row className="mb-4">
                {projects.map((project) => {
                  const total =
                    project.totalMaterialCost +
                    project.totalExpense +
                    (project.totalLaborPayments || 0);

                  return (
                    <Col md={6} lg={4} key={project.projectId} className="mb-3">
                      <Card className="dash-project-card h-100">
                        <Card.Body>
                          <Card.Title className="dash-project-name">
                            {project.projectName}
                          </Card.Title>
                          <div className="dash-project-metrics">
                            <div>
                              <span className="dash-label">Material</span>
                              <span className="dash-value dash-green">
                                ₹{project.totalMaterialCost.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="dash-label">Expenses</span>
                              <span className="dash-value dash-red">
                                ₹{project.totalExpense.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="dash-label">Labour</span>
                              <span className="dash-value dash-blue">
                                ₹
                                {project.totalLaborPayments
                                  ? project.totalLaborPayments.toLocaleString()
                                  : "0"}
                              </span>
                            </div>
                            <div className="dash-total-row">
                              <span className="dash-label">Total Spent</span>
                              <span className="dash-value dash-total">
                                ₹{total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>


              {/* TABLE */}
              <Card className="dash-table-card">
                <Card.Body>
                  <h4 className="mb-3">Detailed project summary</h4>
                  <Table hover responsive className="mb-0 dash-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Material (₹)</th>
                        <th>Expenses (₹)</th>
                        <th>Labour (₹)</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((proj) => {
                        const total =
                          proj.totalMaterialCost +
                          proj.totalExpense +
                          (proj.totalLaborPayments || 0);
                        return (
                          <tr key={proj.projectId}>
                            <td>{proj.projectName}</td>
                            <td>{proj.totalMaterialCost.toLocaleString()}</td>
                            <td>{proj.totalExpense.toLocaleString()}</td>
                            <td>
                              {proj.totalLaborPayments
                                ? proj.totalLaborPayments.toLocaleString()
                                : "0"}
                            </td>
                            <td className="fw-semibold">
                              {total.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Company choice popup */}
      <CompanyChoiceModal
        show={showModal}
        onCreate={handleCreateCompany}
        onJoin={handleJoinCompany}
      />
    </>
  );
};

export default Dashboard;
