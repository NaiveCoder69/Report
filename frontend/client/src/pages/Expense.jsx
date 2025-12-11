import React, { useState, useEffect } from "react";
import API from "../api";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import "../styles/expenses.css";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project: "",
    description: "",
    amount: "",
    date: "",
    category: "",
    remarks: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await API.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/expenses", formData);
      fetchExpenses();
      setShowAddModal(false);
      setFormData({
        project: "",
        description: "",
        amount: "",
        date: "",
        category: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Error adding expense:", error.response?.data || error.message);
      alert("Failed to add expense. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (expense) => {
    setExpenseToDelete(expense);
    setShowConfirmModal(true);
  };

  const handleDeleteExpense = async () => {
    try {
      await API.delete(`/expenses/${expenseToDelete._id}`);
      fetchExpenses();
      setShowConfirmModal(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  return (
    <div className="expenses-shell">
      <div className="expenses-box">
        {/* Header */}
        <div className="expenses-header">
          <div className="expenses-badge">
            <div className="expenses-brand">PNK Construction</div>
            <div className="expenses-present">expense management</div>
          </div>
          <h3 className="expenses-title">Expense Management</h3>
          <p className="expenses-subtitle">
            Track all project expenses in one place.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="expenses-add-btn"
          >
            + Add Expense
          </Button>
        </div>

        {/* Expenses Table */}
        <Table
          bordered
          hover
          responsive
          className="shadow-sm expenses-table mb-0"
        >
          <thead>
            <tr>
              <th>Project</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.project?.name || "-"}</td>
                  <td>{exp.description}</td>
                  <td>{exp.category || "-"}</td>
                  <td>₹{parseFloat(exp.amount || 0).toLocaleString()}</td>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td>{exp.remarks || "-"}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(exp)}
                      className="expenses-delete-btn"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Add Expense Modal – same style as Add Bill */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          size="lg"
        >
          <Modal.Header className="expenses-modal-header" closeButton>
            <Modal.Title className="expenses-modal-title">
              Add New Expense
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="expenses-modal-body">
            <Form onSubmit={handleAddExpense}>
              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">Project</Form.Label>
                <Form.Select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className="expenses-modal-control"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">
                  Description
                </Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="expenses-modal-control"
                  placeholder="What is this expense for?"
                />
              </Form.Group>

              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="expenses-modal-control"
                  placeholder="e.g. Site misc, Travel, Labour"
                />
              </Form.Group>

              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">
                  Amount (₹)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="expenses-modal-control"
                  placeholder="Enter amount"
                />
              </Form.Group>

              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="expenses-modal-control"
                />
              </Form.Group>

              <Form.Group className="expenses-form-group">
                <Form.Label className="expenses-modal-label">
                  Remarks
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="expenses-modal-control"
                  placeholder="Optional remarks"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-3 pt-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="expenses-add-btn"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Expense"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal – red theme */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
        >
          <Modal.Header className="expenses-delete-modal-header" closeButton>
            <Modal.Title className="expenses-delete-modal-title">
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="expenses-delete-modal-body">
            <strong>Are you sure you want to delete this expense?</strong>
            <div className="mt-1 mb-2">
              {expenseToDelete?.description} - ₹{expenseToDelete?.amount}
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
              onClick={handleDeleteExpense}
              disabled={loading}
              className="expenses-delete-modal-btn"
            >
              Delete Expense
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Expenses;
