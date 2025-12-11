import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { Card, Container, Spinner, Table, Row, Col } from "react-bootstrap";
import "../styles/laborContractorDetail.css";

const LaborContractorDetail = () => {
  const { id } = useParams();
  const [contractor, setContractor] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/labor-contractors/${id}`);
        setContractor(res.data.laborContractor);
        setBills(res.data.bills || []);
      } catch (error) {
        setContractor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "30vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="text-danger text-center mt-5">
        Labor Contractor not found!
      </div>
    );
  }

  const totalPaid = bills.reduce(
    (sum, bill) => sum + (Number(bill.amount) || 0),
    0
  );

  return (
    <div className="labor-detail-shell">
      <div className="labor-detail-box">
        {/* Header */}
        <div className="labor-detail-header">
          <div className="labor-detail-badge">
            <div className="labor-detail-brand">PNK Construction</div>
            <div className="labor-detail-present">labor contractor</div>
          </div>
          <h3 className="labor-detail-title">{contractor.name}</h3>
          <p className="labor-detail-subtitle">
            Clean summary of contact details and all payments for this contractor.
          </p>
        </div>

        <Container fluid className="px-0">
          {/* Contact card (on top) */}
          <Card className="labor-detail-card mb-3">
            <Card.Body>
              <h5 className="labor-section-title mb-3">Contact information</h5>
              <Row>
                <Col md={6} className="mb-3 mb-md-0">
                  <p className="mb-1">
                    <span className="labor-label">Contact person:</span>{" "}
                    {contractor.contactPerson || "-"}
                  </p>
                  <p className="mb-1">
                    <span className="labor-label">Phone:</span>{" "}
                    {contractor.phone || "-"}
                  </p>
                  <p className="mb-0">
                    <span className="labor-label">Email:</span>{" "}
                    {contractor.email || "-"}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <span className="labor-label">Address:</span>{" "}
                    {contractor.address || "-"}
                  </p>
                  <p className="mb-0">
                    <span className="labor-label">Notes:</span>{" "}
                    {contractor.notes || "-"}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Summary strip (amounts) */}
          <Card className="labor-detail-card mb-4 labor-summary-card">
            <Card.Body className="py-3">
              <Row className="align-items-center text-center text-md-start">
                <Col md={4} sm={6} xs={12} className="mb-2 mb-md-0">
                  <div className="labor-summary-label">Total paid</div>
                  <div className="labor-summary-value text-success">
                    ₹{totalPaid.toLocaleString()}
                  </div>
                </Col>
                <Col md={4} sm={6} xs={12} className="mb-2 mb-md-0">
                  <div className="labor-summary-label">Total bills</div>
                  <div className="labor-summary-value">
                    {bills.length}
                  </div>
                </Col>
                <Col md={4} sm={12} xs={12}>
                  <div className="labor-summary-label">Latest payment date</div>
                  <div className="labor-summary-value">
                    {bills.length
                      ? new Date(
                          [...bills].sort(
                            (a, b) =>
                              new Date(b.billDate) - new Date(a.billDate)
                          )[0].billDate
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payment timeline */}
          <Card className="labor-detail-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="labor-section-title mb-0">Payment history</h5>
                <span className="text-muted small">
                  All bills raised for this contractor
                </span>
              </div>

              {bills.length === 0 ? (
                <p className="text-muted mb-0">
                  No bills or payments recorded for this labor contractor yet.
                </p>
              ) : (
                <div className="labor-detail-table-wrapper">
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="labor-detail-table mb-0"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>Bill no.</th>
                        <th>Project</th>
                        <th>Amount (₹)</th>
                        <th>Date</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill._id}>
                          <td>{bill.billNumber}</td>
                          <td>{bill.project?.name || "-"}</td>
                          <td>
                            ₹{Number(bill.amount || 0).toLocaleString()}
                          </td>
                          <td>
                            {new Date(bill.billDate).toLocaleDateString()}
                          </td>
                          <td>{bill.remarks || "-"}</td>
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

export default LaborContractorDetail;
