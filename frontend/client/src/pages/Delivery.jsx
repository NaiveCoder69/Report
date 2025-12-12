import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Table, Row, Col, Modal, Spinner } from "react-bootstrap";
// import { io } from "socket.io-client";
import "../styles/delivery.css";

// Base URL: from env in production, fallback to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Socket disabled for now in deployed version
// const socket = io(API_BASE_URL);

const Delivery = () => {
  const [formData, setFormData] = useState({
    project: "",
    vendor: "",
    material: "",
    quantity: "",
    rate: "",
    date: "",
  });

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [editData, setEditData] = useState({
    project: "",
    vendor: "",
    material: "",
    quantity: "",
    rate: "",
    date: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Filters
  const [projectFilter, setProjectFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchDropdowns();
    fetchDeliveries();

    // Real-time socket updates disabled in deployed version
    // socket.on("addMaterialDelivery", (newDelivery) => {
    //   setDeliveries((prev) => {
    //     const filtered = prev.filter((d) => d._id !== newDelivery._id);
    //     const next = [newDelivery, ...filtered];
    //     return next.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    //   });
    // });

    // return () => {
    //   socket.off("addMaterialDelivery");
    // };
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [projectRes, vendorRes, materialRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/projects`, config),
        axios.get(`${API_BASE_URL}/api/vendors`, config),
        axios.get(`${API_BASE_URL}/api/materials`, config),
      ]);
      setProjects(projectRes.data || []);
      setVendors(vendorRes.data || []);
      setMaterials(materialRes.data || []);
    } catch (err) {
      console.error("Dropdown fetch error:", err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/material-deliveries`,
        config
      );
      const sorted = Array.isArray(res.data)
        ? res.data.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
      setDeliveries(sorted);
    } catch (err) {
      console.error("Deliveries fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/material-deliveries`,
        payload,
        config
      );
      const newDelivery = response.data;

      setDeliveries((prev) => {
        const filtered = prev.filter((d) => d._id !== newDelivery._id);
        const next = [newDelivery, ...filtered];
        return next.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      setFormData({
        project: "",
        vendor: "",
        material: "",
        quantity: "",
        rate: "",
        date: "",
      });
    } catch (error) {
      console.error("Error adding material delivery:", error);
      alert("Error adding material delivery. Please check console.");
    }
  };

  const confirmDelete = (delivery) => {
    setDeliveryToDelete(delivery);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!deliveryToDelete) return;
    setLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/material-deliveries/${deliveryToDelete._id}`,
        config
      );
      setDeliveries((prev) =>
        prev.filter((d) => d._id !== deliveryToDelete._id)
      );
      setShowConfirmModal(false);
      setDeliveryToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete delivery. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Edit logic -----

  const openEditModal = (delivery) => {
    setEditingDelivery(delivery);
    setEditData({
      project: delivery.project?._id || delivery.project,
      vendor: delivery.vendor?._id || delivery.vendor,
      material: delivery.material?._id || delivery.material,
      quantity: delivery.quantity,
      rate: delivery.rate,
      date: delivery.date ? delivery.date.substring(0, 10) : "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDelivery) return;
    setEditLoading(true);
    try {
      const payload = {
        ...editData,
        quantity: Number(editData.quantity),
        rate: Number(editData.rate),
      };

      const res = await axios.put(
        `${API_BASE_URL}/api/material-deliveries/${editingDelivery._id}`,
        payload,
        config
      );

      const updated = res.data;

      setDeliveries((prev) => {
        const next = prev.map((d) => (d._id === updated._id ? updated : d));
        return next.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      setShowEditModal(false);
      setEditingDelivery(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update delivery. Check console.");
    } finally {
      setEditLoading(false);
    }
  };

  // ----- Filtering (project + date range) -----

  const filteredDeliveries = deliveries.filter((d) => {
    const dDate = new Date(d.date);

    if (projectFilter && (d.project?._id || d.project) !== projectFilter) {
      return false;
    }
    if (fromDate && dDate < new Date(fromDate)) {
      return false;
    }
    if (toDate && dDate > new Date(toDate)) {
      return false;
    }
    return true;
  });

  return (
    <div className="delivery-shell">
      <div className="delivery-box">
        {/* Header */}
        <div className="delivery-header">
          <div className="delivery-badge">
            <div className="delivery-brand">PNK Constrction</div>
            <div className="delivery-present">material delivery</div>
          </div>
          <h3 className="delivery-title">Material Delivery Entry</h3>
          <p className="delivery-subtitle">
            Track material deliveries from vendors to your projects in real-time.
          </p>
        </div>

        {/* Top card: form only */}
        <div className="delivery-form-card">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Project</Form.Label>
                  <Form.Select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Vendor</Form.Label>
                  <Form.Select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Material</Form.Label>
                  <Form.Select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  >
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 delivery-form-row-bottom align-items-end">
              <Col md={3}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Rate (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="rate"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="delivery-form-group">
                  <Form.Label className="delivery-form-label">Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="delivery-form-control"
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="delivery-action-col">
                <Button type="submit" className="delivery-button">
                  Add Delivery
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        {/* Bottom card: filters + table */}
        <div className="delivery-table-card">
          <h4 className="delivery-table-title">All Material Deliveries</h4>

          {/* Filters */}
          <Row className="mb-2 g-2">
            <Col md={4} sm={12}>
              <Form.Select
                size="sm"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="">All projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} sm={6}>
              <Form.Control
                size="sm"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From date"
              />
            </Col>
            <Col md={3} sm={6}>
              <Form.Control
                size="sm"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To date"
              />
            </Col>
          </Row>

          <div className="delivery-table-wrapper">
            <Table
              striped
              bordered
              hover
              responsive
              className="shadow-sm delivery-table mb-0"
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Vendor</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Rate (₹)</th>
                  <th>Total (₹)</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((d, i) => (
                    <tr key={d._id}>
                      <td>{i + 1}</td>
                      <td>{d.project?.name || "N/A"}</td>
                      <td>{d.vendor?.name || "N/A"}</td>
                      <td>{d.material?.name || "N/A"}</td>
                      <td>{d.quantity}</td>
                      <td>{parseFloat(d.rate || 0).toLocaleString()}</td>
                      <td>{(d.quantity * d.rate).toLocaleString()}</td>
                      <td>{new Date(d.date).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(d)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(d)}
                          className="delivery-delete-btn"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      No deliveries available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header className="delivery-delete-modal-header" closeButton>
          <Modal.Title className="delivery-delete-modal-title">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="delivery-delete-modal-body">
          <strong>Are you sure you want to delete this delivery?</strong>
          <div className="mt-1 mb-2">
            {deliveryToDelete?.material?.name} - {deliveryToDelete?.quantity} units
          </div>
          <p className="text-muted mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="delivery-delete-modal-btn"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Delivery"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Delivery</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project</Form.Label>
              <Form.Select
                name="project"
                value={editData.project}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vendor</Form.Label>
              <Form.Select
                name="vendor"
                value={editData.vendor}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Material</Form.Label>
              <Form.Select
                name="material"
                value={editData.material}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={editData.quantity}
                onChange={handleEditChange}
                min="1"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rate (₹)</Form.Label>
              <Form.Control
                type="number"
                name="rate"
                value={editData.rate}
                onChange={handleEditChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={editData.date}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowEditModal(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editLoading}>
              {editLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Delivery;
