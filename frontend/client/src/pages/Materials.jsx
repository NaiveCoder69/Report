import React, { useState, useEffect } from "react";
import { Card, Form, Button, Table, Modal, Row, Col } from "react-bootstrap";
import API from "../api"; // Use API with token interceptor
import "../styles/materials.css";

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState("");
  const [unitType, setUnitType] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await API.get("/materials");
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !unitType) return;
    try {
      if (editMode) {
        await API.put(`/materials/${editId}`, { name, unitType });
      } else {
        await API.post("/materials", { name, unitType });
      }
      setName("");
      setUnitType("");
      setEditMode(false);
      setEditId(null);
      fetchMaterials();
    } catch (err) {
      console.error("Error saving material:", err);
    }
  };

  const handleEdit = (material) => {
    setName(material.name);
    setUnitType(material.unitType);
    setEditMode(true);
    setEditId(material._id);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`/materials/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchMaterials();
    } catch (err) {
      console.error("Error deleting material:", err);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setName("");
    setUnitType("");
  };

  return (
    <div className="materials-shell">
      <div className="materials-box">
        {/* HEADER */}
        <div className="mb-3">
          <div className="materials-badge">
            <div className="materials-brand">PNK Construction</div>
            <div className="materials-present">materials master</div>
          </div>
          <h2 className="materials-title">Materials</h2>
          <p className="materials-subtitle">
            Define standard materials and unit types used across your projects.
          </p>
        </div>

        {/* Add/Edit Form */}
        <Card className="p-4 mb-4 shadow-sm materials-card">
          <h5 className="mb-3">{editMode ? "Edit material" : "Add a new material"}</h5>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Material name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="materials-input"
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Unit type (e.g., bag, ton, truck)"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="materials-input"
                  required
                />
              </Col>
              <Col md={12}>
                <Button type="submit" className="materials-button w-100 mt-2">
                  {editMode ? "Update material" : "Add material"}
                </Button>
                {editMode && (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="w-100 mt-2"
                    onClick={resetForm}
                  >
                    Cancel edit
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Material Table */}
        <Card className="shadow-sm materials-card">
          <Card.Body>
            <h5 className="mb-3">Material list</h5>
            <Table hover responsive className="materials-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No materials added yet.
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material._id}>
                      <td>{material.name}</td>
                      <td>{material.unitType}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(material)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteModal(material._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this material? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeDeleteModal} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Yes, delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Materials;
