import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import API from "../api";
import "../styles/bills.css";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [laborContractors, setLaborContractors] = useState([]);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    billNumber: "",
    recipientType: "vendor",
    vendor: "",
    laborContractor: "",
    project: "",
    amount: "",
    billDate: "",
    remarks: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [projectFilter, setProjectFilter] = useState("");
  const [recipientFilter, setRecipientFilter] = useState(""); // "", "vendor", "labor-contractor"
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ---------- sort + auto-number helpers ----------

  const sortByBillNumber = (a, b) => {
    const aMatch = a.billNumber?.toString().match(/(\d+)\s*$/);
    const bMatch = b.billNumber?.toString().match(/(\d+)\s*$/);

    if (!aMatch || !bMatch) {
      return (a.billNumber || "").localeCompare(b.billNumber || "");
    }

    const aNum = parseInt(aMatch[1], 10);
    const bNum = parseInt(bMatch[1], 10);
    return aNum - bNum; // ascending
  };

  const getNextBillNumber = () => {
    if (!bills.length) return "";

    let maxNum = null;
    let pattern = null;

    bills.forEach((b) => {
      const bn = b.billNumber?.toString();
      if (!bn) return;
      const match = bn.match(/(\d+)\s*$/);
      if (!match) return;
      const num = parseInt(match[1], 10);
      if (maxNum === null || num > maxNum) {
        maxNum = num;
        pattern = { base: bn, digits: match[1] };
      }
    });

    if (maxNum === null || !pattern) return "";

    const next = maxNum + 1;
    const width = pattern.digits.length;
    const padded = next.toString().padStart(width, "0");
    return pattern.base.replace(/(\d+)\s*$/, padded);
  };

  // ---------- data fetching ----------

  useEffect(() => {
    fetchBills();
    fetchVendors();
    fetchLaborContractors();
    fetchProjects();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await API.get("/bills");
      const sorted = Array.isArray(res.data)
        ? res.data.slice().sort(sortByBillNumber)
        : [];
      setBills(sorted);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await API.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchLaborContractors = async () => {
    try {
      const res = await API.get("/labor-contractors");
      setLaborContractors(res.data);
    } catch (err) {
      console.error("Error fetching labor contractors:", err);
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

  // ---------- handlers ----------

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "recipientType") {
      setFormData((prev) => ({
        ...prev,
        recipientType: value,
        vendor: "",
        laborContractor: "",
        project: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      billNumber: formData.billNumber,
      amount: formData.amount,
      billDate: formData.billDate,
      remarks: formData.remarks,
    };

    if (formData.recipientType === "vendor") {
      postData.vendor = formData.vendor;
    } else if (formData.recipientType === "labor-contractor") {
      postData.laborContractor = formData.laborContractor;
      postData.project = formData.project;
    }

    try {
      const res = await API.post("/bills", postData);
      const newBill = res.data;

      setBills((prev) => {
        const filtered = prev.filter((b) => b._id !== newBill._id);
        const next = [...filtered, newBill];
        return next.slice().sort(sortByBillNumber);
      });

      setShowAddModal(false);
      setFormData({
        billNumber: "",
        recipientType: "vendor",
        vendor: "",
        laborContractor: "",
        project: "",
        amount: "",
        billDate: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Error adding bill:", error.response?.data || error.message);
      alert("Failed to add bill. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (bill) => {
    setBillToDelete(bill);
    setShowConfirmModal(true);
  };

  const handleDeleteBill = async () => {
    try {
      await API.delete(`/bills/${billToDelete._id}`);
      setBills((prev) => prev.filter((b) => b._id !== billToDelete._id));
      setShowConfirmModal(false);
      setBillToDelete(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Failed to delete bill");
    }
  };

  // ---------- filtering ----------

  const filteredBills = bills.filter((bill) => {
    const hasVendor = !!bill.vendor;
    const hasLabor = !!bill.laborContractor;
    const billDateObj = new Date(bill.billDate);

    if (recipientFilter === "vendor" && !hasVendor) return false;
    if (recipientFilter === "labor-contractor" && !hasLabor) return false;

    if (projectFilter) {
      const billProjectId = bill.project?._id || bill.project;
      if (!billProjectId || billProjectId !== projectFilter) return false;
    }

    if (fromDate && billDateObj < new Date(fromDate)) return false;
    if (toDate && billDateObj > new Date(toDate)) return false;

    return true;
  });

  // ---------- JSX ----------

  return (
    <div className="bills-shell">
      <div className="bills-box">
        {/* Header */}
        <div className="bills-header">
          <div className="bills-badge">
            <div className="bills-brand">PNK Construction</div>
            <div className="bills-present">billing management</div>
          </div>
          <h3 className="bills-title">Billing Management</h3>
          <p className="bills-subtitle">
            Manage your bills with vendors and labor contractors.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                billNumber: getNextBillNumber() || prev.billNumber || "",
              }));
              setShowAddModal(true);
            }}
            className="bills-button"
          >
            + Add Bill
          </Button>
        </div>

        {/* Filters */}
        <div className="bills-filters mb-3">
          <Form className="d-flex flex-wrap gap-2">
            <Form.Select
              size="sm"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="">All recipients</option>
              <option value="vendor">Vendors only</option>
              <option value="labor-contractor">Labor contractors only</option>
            </Form.Select>

            <Form.Select
              size="sm"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{ maxWidth: 220 }}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              size="sm"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ maxWidth: 160 }}
            />

            <Form.Control
              size="sm"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ maxWidth: 160 }}
            />
          </Form>
        </div>

        {/* Bills Table */}
        <Table
          bordered
          hover
          responsive
          className="shadow-sm bills-table mb-0"
        >
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Recipient</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>
                  <td>{bill.vendor?.name || bill.laborContractor?.name || "-"}</td>
                  <td>₹{parseFloat(bill.amount || 0).toLocaleString()}</td>
                  <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                  <td>{bill.remarks || "-"}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(bill)}
                      className="bills-delete-btn"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Add Bill Modal */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          size="lg"
        >
          <Modal.Header className="bills-modal-header" closeButton>
            <Modal.Title className="bills-modal-title">
              Add New Bill
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bills-modal-body">
            <Form onSubmit={handleAddBill}>
              <Form.Group className="bills-form-group">
                <Form.Label className="bills-modal-form-label">
                  Bill Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleChange}
                  className="bills-modal-form-control"
                  required
                  placeholder="Enter bill number"
                />
              </Form.Group>

              <Form.Group className="bills-form-group">
                <Form.Label className="bills-modal-form-label">
                  Bill Recipient
                </Form.Label>
                <Form.Select
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleChange}
                  className="bills-modal-form-control"
                  required
                >
                  <option value="vendor">Vendor</option>
                  <option value="labor-contractor">Labor Contractor</option>
                </Form.Select>
              </Form.Group>

              {formData.recipientType === "vendor" && (
                <Form.Group className="bills-form-group">
                  <Form.Label className="bills-modal-form-label">
                    Vendor
                  </Form.Label>
                  <Form.Select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="bills-modal-form-control"
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
              )}

              {formData.recipientType === "labor-contractor" && (
                <>
                  <Form.Group className="bills-form-group">
                    <Form.Label className="bills-modal-form-label">
                      Labor Contractor
                    </Form.Label>
                    <Form.Select
                      name="laborContractor"
                      value={formData.laborContractor}
                      onChange={handleChange}
                      className="bills-modal-form-control"
                      required
                    >
                      <option value="">Select Labor Contractor</option>
                      {laborContractors.map((lc) => (
                        <option key={lc._id} value={lc._id}>
                          {lc.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="bills-form-group">
                    <Form.Label className="bills-modal-form-label">
                      Project
                    </Form.Label>
                    <Form.Select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="bills-modal-form-control"
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
                </>
              )}

              <Form.Group className="bills-form-group">
                <Form.Label className="bills-modal-form-label">
                  Amount (₹)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="bills-modal-form-control"
                  required
                  placeholder="Enter amount"
                />
              </Form.Group>

              <Form.Group className="bills-form-group">
                <Form.Label className="bills-modal-form-label">
                  Bill Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="billDate"
                  value={formData.billDate}
                  onChange={handleChange}
                  className="bills-modal-form-control"
                  required
                />
              </Form.Group>

              <Form.Group className="bills-form-group">
                <Form.Label className="bills-modal-form-label">
                  Remarks
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="bills-modal-form-control"
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
                  className="bills-button"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Bill"
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
          <Modal.Header className="bills-delete-modal-header" closeButton>
            <Modal.Title className="bills-delete-modal-title">
              Confirm Delete
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bills-delete-modal-body">
            <strong>Are you sure you want to delete this bill?</strong>
            <div className="mt-1 mb-2">
              Bill #{billToDelete?.billNumber} - ₹{billToDelete?.amount}
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
              onClick={handleDeleteBill}
              disabled={loading}
              className="bills-delete-modal-btn"
            >
              Delete Bill
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Bills;
