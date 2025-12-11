import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { Container, Card, Table, Spinner } from "react-bootstrap";
import "../styles/vendorDetails.css";

const VendorDetails = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [bills, setBills] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalMaterialCost: 0,
    totalPaid: 0,
    remainingAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vendorRes = await API.get(`/vendors/${id}`);
        setVendor(vendorRes.data);

        try {
          const deliveriesRes = await API.get(
            `/material-deliveries?vendor=${id}`
          );
          setDeliveries(deliveriesRes.data);
        } catch (err) {
          setDeliveries([]);
        }

        try {
          const billsRes = await API.get(`/bills?vendor=${id}`);
          setBills(billsRes.data);
        } catch (err) {
          setBills([]);
        }

        try {
          const summaryRes = await API.get(`/vendors/${id}/financial-summary`);
          setFinancialSummary(summaryRes.data);
        } catch (err) {
          setFinancialSummary({
            totalMaterialCost: 0,
            totalPaid: 0,
            remainingAmount: 0,
          });
        }
      } catch (err) {
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Spinner animation="border" className="d-block mx-auto mt-5" />
    );

  if (!vendor || !vendor._id)
    return (
      <div className="text-center text-danger mt-5">Vendor not found</div>
    );

  return (
    <div className="vendor-details-shell">
      <div className="vendor-details-box">
        {/* Header */}
        <div className="vendor-details-header">
          <div className="vendor-details-badge">
            <div className="vendor-details-brand">PNK Constrction</div>
            <div className="vendor-details-present">vendor profile</div>
          </div>
          <h3 className="vendor-details-title">
            {vendor.name || "Vendor Details"}
          </h3>
          <p className="vendor-details-subtitle">
            Complete snapshot of this vendor’s contact info, deliveries, and
            billing history.
          </p>
        </div>

        <Container fluid className="px-0">
          {/* Contact card */}
          <Card className="vendor-card mb-4">
            <Card.Body>
              <h5 className="vendor-section-title">Contact Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <span className="vendor-label">Contact Person:</span>{" "}
                    {vendor.contactPerson || "-"}
                  </p>
                  <p>
                    <span className="vendor-label">Phone:</span>{" "}
                    {vendor.phone || "-"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <span className="vendor-label">Email:</span>{" "}
                    {vendor.email || "-"}
                  </p>
                  <p>
                    <span className="vendor-label">Address:</span>{" "}
                    {vendor.address || "-"}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Financial summary */}
          <Card className="vendor-card mb-4">
            <Card.Body>
              <h5 className="vendor-section-title">Financial Summary</h5>
              <div className="row text-center">
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="vendor-summary-chip vendor-summary-blue">
                    <span className="vendor-summary-label">
                      Total Material Cost
                    </span>
                    <span className="vendor-summary-value">
                      ₹{financialSummary.totalMaterialCost.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="vendor-summary-chip vendor-summary-green">
                    <span className="vendor-summary-label">Total Paid</span>
                    <span className="vendor-summary-value">
                      ₹{financialSummary.totalPaid.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="vendor-summary-chip vendor-summary-orange">
                    <span className="vendor-summary-label">
                      Remaining Amount
                    </span>
                    <span className="vendor-summary-value">
                      ₹{financialSummary.remainingAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Deliveries */}
          <Card className="vendor-card mb-4">
            <Card.Body>
              <h5 className="vendor-section-title">Deliveries Timeline</h5>
              {deliveries.length === 0 ? (
                <p className="text-muted mb-0">
                  No deliveries found for this vendor.
                </p>
              ) : (
                <div className="vendor-table-wrapper">
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="vendor-table mb-0"
                  >
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Rate (₹)</th>
                        <th>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((d) => (
                        <tr key={d._id}>
                          <td>
                            {new Date(d.date).toLocaleDateString()}
                          </td>
                          <td>{d.material?.name || "-"}</td>
                          <td>{d.quantity}</td>
                          <td>{d.material?.unitType || "-"}</td>
                          <td>{d.rate}</td>
                          <td>
                            {d.rate && d.quantity
                              ? (d.rate * d.quantity).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Bills */}
          <Card className="vendor-card mb-0">
            <Card.Body>
              <h5 className="vendor-section-title">Bills & Payments</h5>
              {bills.length === 0 ? (
                <p className="text-muted mb-0">
                  No bills or payments found for this vendor.
                </p>
              ) : (
                <div className="vendor-table-wrapper">
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="vendor-table mb-0"
                  >
                    <thead>
                      <tr>
                        <th>Bill No.</th>
                        <th>Amount (₹)</th>
                        <th>Date</th>
                        <th>Remarks</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((b) => (
                        <tr key={b._id}>
                          <td>{b.billNumber}</td>
                          <td>{b.amount}</td>
                          <td>
                            {new Date(b.billDate).toLocaleDateString()}
                          </td>
                          <td>{b.remarks || "-"}</td>
                          <td>{b.status || "Paid"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default VendorDetails;
