import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Table, Button, Form, Alert, Spinner } from "react-bootstrap";
import API from "../api";
import { AuthContext } from "../contexts/AuthContext";

const roles = ["Sub-Admin", "Engineer"];

export default function ProjectAccessManagement() {
  const { id } = useParams(); // projectId
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/project-access/${id}`);
      setAssignments(res.data);
    } catch (err) {
      setError("Failed to fetch project access assignments.");
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users"); // You may want to create this API to list all users
      setUsers(res.data);
    } catch {
      setError("Failed to fetch user list.");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser || !selectedRole) {
      setError("Please select both user and role.");
      return;
    }

    setActionLoading(true);
    try {
      await API.post("/project-access", {
        project: id,
        user: selectedUser,
        role: selectedRole,
      });
      await fetchAssignments();
      setSelectedUser("");
      setSelectedRole("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign access.");
    }
    setActionLoading(false);
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm("Remove this user from project?")) return;
    setActionLoading(true);
    setError(null);
    try {
      await API.delete(`/project-access/${assignmentId}`);
      await fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove access.");
    }
    setActionLoading(false);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Container>
      <h2>Project Access Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleAssign} className="mb-4">
        <Form.Group controlId="userSelect" className="mb-3">
          <Form.Label>User</Form.Label>
          <Form.Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="roleSelect" className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button type="submit" disabled={actionLoading}>
          {actionLoading ? "Assigning..." : "Assign Access"}
        </Button>
      </Form>

      <Table bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Assigned By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No assignments yet.
              </td>
            </tr>
          ) : (
            assignments.map((item) => (
              <tr key={item._id}>
                <td>{item.user?.name} ({item.user?.email})</td>
                <td>{item.role}</td>
                <td>{item.assignedBy}</td> {/* Could be populated with a name if desired */}
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleRemove(item._id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}
