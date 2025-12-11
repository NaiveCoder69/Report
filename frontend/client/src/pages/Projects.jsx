import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "../styles/projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    location: "",
    budget: "",
    startDate: "",
    endDate: "",
    assignedEngineer: "",
  });

  const [deleteTarget, setDeleteTarget] = useState(null); // project to delete
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/projects", formData);
      fetchProjects();
      setFormData({
        name: "",
        client: "",
        location: "",
        budget: "",
        startDate: "",
        endDate: "",
        assignedEngineer: "",
      });
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const openDeleteModal = (project) => {
    setDeleteTarget(project);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/projects/${deleteTarget._id}`);
      fetchProjects();
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="projects-shell">
        <div className="projects-box">
          {/* HEADER */}
          <div className="mb-3">
            <div className="projects-badge">
              <div className="projects-brand">PNK Construction</div>
              <div className="projects-present">project management</div>
            </div>
            <h2 className="projects-title">Projects</h2>
            <p className="projects-subtitle">
              Create new projects and keep track of all active sites in one place.
            </p>
          </div>

          {/* CREATE PROJECT FORM */}
          <Card className="p-4 mb-4 shadow-sm projects-card">
            <h5 className="mb-3">Add a new project</h5>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Control
                    className="projects-input"
                    placeholder="Project name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    className="projects-input"
                    placeholder="Client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    className="projects-input"
                    placeholder="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="number"
                    className="projects-input"
                    placeholder="Budget (₹) — optional"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="date"
                    className="projects-input"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="date"
                    className="projects-input"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    className="projects-input"
                    placeholder="Assigned engineer"
                    name="assignedEngineer"
                    value={formData.assignedEngineer}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={12}>
                  <Button type="submit" className="w-100 projects-button">
                    Add project
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* PROJECTS TABLE */}
          <Card className="p-3 shadow-sm projects-card">
            <h5 className="mb-3">All projects</h5>
            <Table hover responsive className="projects-table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Budget (₹)</th>
                  <th>Engineer</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Delete</th>
                  <th>Details & Access</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No projects created yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <Link
                          to={`/projects/${p._id}`}
                          style={{
                            textDecoration: "none",
                            color: "#2563eb",
                            fontWeight: 500,
                          }}
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td>{p.client}</td>
                      <td>{p.location}</td>
                      <td>{p.budget ? p.budget : "-"}</td>
                      <td>{p.assignedEngineer}</td>
                      <td>{new Date(p.startDate).toLocaleDateString()}</td>
                      <td>
                        {p.endDate
                          ? new Date(p.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(p)}
                        >
                          Delete
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/projects/${p._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/project-access/${p._id}`)}
                        >
                          Access
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal show={!!deleteTarget} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ marginBottom: 0 }}>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?<br />
            This will also remove related bills, expenses and deliveries.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeDeleteModal} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteProject}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Projects;
