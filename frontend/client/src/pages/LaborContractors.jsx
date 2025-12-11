import React, { useEffect, useState } from "react";
import API from "../api";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/laborContractors.css";

const LaborContractors = () => {
  const [contractors, setContractors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success"); // "success" | "error"

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    projects: [], // array for multiple project IDs
  });

  useEffect(() => {
    fetchContractors();
    fetchProjects();
  }, []);

  const showStatus = (msg, type = "success") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const fetchContractors = async () => {
    try {
      const res = await API.get("/labor-contractors");
      setContractors(res.data);
    } catch (error) {
      console.error("Failed to fetch labor contractors", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiProjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (o) => o.value
    );
    setFormData({ ...formData, projects: selectedOptions });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projects || formData.projects.length === 0) {
      showStatus("Please select at least one project.", "error");
      return;
    }

    setLoadingAdd(true);

    try {
      await API.post("/labor-contractors", formData);
      showStatus("Labor contractor added successfully!", "success");
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        projects: [],
      });
      setShowAddModal(false);
      fetchContractors();
    } catch (error) {
      console.error("Failed to add labor contractor", error.response || error);
      showStatus(
        "Failed to add labor contractor. Check console for details.",
        "error"
      );
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this labor contractor?"
      )
    ) {
      return;
    }
    setLoadingDelete(id);
    try {
      await API.delete(`/labor-contractors/${id}`);
      showStatus("Labor contractor deleted.", "success");
      fetchContractors();
    } catch (error) {
      console.error("Failed to delete labor contractor", error);
      showStatus("Failed to delete labor contractor. Check console.", "error");
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="labor-shell">
      <div className="labor-box">
        {/* Header */}
        <div className="labor-header">
          <div className="labor-badge">
            <div className="labor-brand">PNK Constrction</div>
            <div className="labor-present">labor contractors</div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="labor-title">Labor Contractors</h3>
              <p className="labor-subtitle">
                Manage all labor contractors and their assigned projects.
              </p>
            </div>
            <Button
              className="labor-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Labor Contractor
            </Button>
          </div>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div
            className={`labor-status-banner ${
              statusType === "error"
                ? "labor-status-error"
                : "labor-status-success"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <Container fluid className="px-0">
          {/* Contractors table */}
          <div className="labor-table-card">
            <div className="labor-table-wrapper">
              <Table
                striped
                bordered
                hover
                responsive
                className="labor-table mb-0"
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Projects</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contractors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-muted py-4"
                      >
                        No labor contractors added yet.
                      </td>
                    </tr>
                  ) : (
                    contractors.map((c) => (
                      <tr key={c._id}>
                        <td className="fw-semibold">
                          <Link
                            to={`/labor-contractors/${c._id}`}
                            className="labor-link"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td>{c.contactPerson || "-"}</td>
                        <td>{c.phone || "-"}</td>
                        <td>{c.email || "-"}</td>
                        <td>
                          {c.projects && c.projects.length > 0
                            ? c.projects
                                .map((p) => p.name || p)
                                .join(", ")
                            : "-"}
                        </td>
                        <td>
                          <Link to={`/labor-contractors/${c._id}`}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2 labor-view-btn"
                            >
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(c._id)}
                            disabled={loadingDelete === c._id}
                            className="labor-delete-btn"
                          >
                            {loadingDelete === c._id ? (
                              <Spinner
                                animation="border"
                                size="sm"
                              />
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Container>

        {/* Add Labor Contractor Modal */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          className="labor-modal"
        >
          <Modal.Header className="labor-modal-header" closeButton>
            <Modal.Title className="labor-modal-title">
              Add Labor Contractor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="labor-modal-body">
            <Form onSubmit={handleAddSubmit}>
              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="labor-form-control"
                />
              </Form.Group>

              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Contact Person
                </Form.Label>
                <Form.Control
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="labor-form-control"
                />
              </Form.Group>

              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Phone *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="labor-form-control"
                />
              </Form.Group>

              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="labor-form-control"
                />
              </Form.Group>

              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="labor-form-control"
                />
              </Form.Group>

              <Form.Group className="labor-form-group">
                <Form.Label className="labor-form-label">
                  Projects *
                </Form.Label>
                <Form.Control
                  as="select"
                  multiple
                  name="projects"
                  value={formData.projects}
                  onChange={handleMultiProjectChange}
                  required
                  className="labor-form-control"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 pt-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={loadingAdd}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loadingAdd}
                  className="labor-modal-save-btn"
                >
                  {loadingAdd ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Add Contractor"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default LaborContractors;
