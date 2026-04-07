import { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../src/firebase/FireBaseConfig";

export default function ProfileModal({ show, onHide, user, onProfileSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user?.name || "");
      setRole(user?.role || "student");
      setError("");
      setSuccess("");
      setIsEditing(!Boolean(user?.name && user?.role));
    }
  }, [user, show]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedData = {
        name: name.trim(),
        role
      };
      await updateDoc(doc(db, "users", user.uid), updatedData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      if (onProfileSaved) {
        onProfileSaved({ ...user, ...updatedData });
      }
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    if (!show) return null;
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Loading Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <Spinner animation="border" role="status" />
          <div className="mt-3">Loading user profile...</div>
        </Modal.Body>
      </Modal>
    );
  }

  const initials = user.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              {initials}
            </div>
            <span>User Profile</span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {isEditing ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </Form.Select>
            </Form.Group>
          </Form>
        ) : (
          <Row>
            <Col>
              <p className="mb-2">
                <strong>Name:</strong> {user.name}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-0">
                <strong>Role:</strong> <span style={{ textTransform: "capitalize" }}>{user.role}</span>
              </p>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                setName(user.name || "");
                setRole(user.role || "student");
                setError("");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="warning"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}