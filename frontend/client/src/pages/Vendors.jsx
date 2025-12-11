import React, { useEffect, useState } from "react";
import API from "../api"; // Adjust path if needed
import { Link } from "react-router-dom";
import "../styles/vendors.css";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await API.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/vendors", formData);
      setMessage("✅ Vendor added successfully!");
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });
      fetchVendors();
    } catch (err) {
      if (err.response && err.response.data.message) {
        setMessage(`⚠️ ${err.response.data.message}`);
      } else {
        setMessage("❌ Error adding vendor");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await API.delete(`/vendors/${id}`);
      setMessage("✅ Vendor deleted successfully!");
      fetchVendors();
    } catch (err) {
      console.error("Error deleting vendor:", err);
      setMessage("❌ Failed to delete vendor");
    }
  };

  return (
    <div className="vendors-shell">
      <div className="vendors-box">
        {/* Header */}
        <div className="vendors-header">
          <div className="vendors-badge">
            <div className="vendors-brand">PNK Constrction</div>
            <div className="vendors-present">vendor management</div>
          </div>
          <h3 className="vendors-title">Vendor Management</h3>
          <p className="vendors-subtitle">
            Add, view, and manage all your project vendors in one place.
          </p>
        </div>

        {/* Add Vendor Card */}
        <div className="vendors-form-card">
          <div className="vendors-form-header">
            <h4 className="vendors-form-title">Add New Vendor</h4>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="vendors-form-label">Vendor Name</label>
                <input
                  type="text"
                  className="form-control vendors-form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="col-md-6">
                <label className="vendors-form-label">Contact Person</label>
                <input
                  type="text"
                  className="form-control vendors-form-control"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person"
                />
              </div>
              <div className="col-md-4">
                <label className="vendors-form-label">Phone</label>
                <input
                  type="text"
                  className="form-control vendors-form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>
              <div className="col-md-4">
                <label className="vendors-form-label">Email</label>
                <input
                  type="email"
                  className="form-control vendors-form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>
              <div className="col-md-4">
                <label className="vendors-form-label">Address</label>
                <input
                  type="text"
                  className="form-control vendors-form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="vendors-button">
                Add Vendor
              </button>
            </div>
          </form>

          {message && (
            <div className="alert alert-info mt-3 fw-semibold text-center">
              {message}
            </div>
          )}
        </div>

        {/* Vendor List Card */}
        <div className="vendors-table-card">
          <h4 className="vendors-table-title">All Vendors</h4>

          {vendors.length === 0 ? (
            <p className="text-muted mb-0">No vendors added yet.</p>
          ) : (
            <div className="table-responsive vendors-table-wrapper">
              <table className="table align-middle vendors-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, index) => (
                    <tr key={vendor._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">
                        <Link
                          to={`/vendors/${vendor._id}`}
                          className="vendors-link"
                        >
                          {vendor.name}
                        </Link>
                      </td>
                      <td>{vendor.contactPerson}</td>
                      <td>{vendor.phone}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.address}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm vendors-delete-btn"
                          onClick={() => handleDelete(vendor._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vendors;
