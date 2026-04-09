// Debug component to check what's working in admin dashboard
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { Card, Container, Row, Col, Badge, Alert, Spinner } from "react-bootstrap";

export default function DebugAdmin() {
  const [colleges, setColleges] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkData = async () => {
      try {
        // Check colleges
        const collegesSnapshot = await getDocs(collection(db, "colleges"));
        const collegesData = collegesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setColleges(collegesData);

        // Check users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        // Check feedback
        const feedbackSnapshot = await getDocs(collection(db, "feedback"));
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeedback(feedbackData);

      } catch (error) {
        console.error("Debug error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Checking data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Debug Admin Dashboard</h2>
      
      {error && <Alert variant="danger">Error: {error}</Alert>}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{colleges.length}</h3>
              <p>Colleges</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{users.length}</h3>
              <p>Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{feedback.length}</h3>
              <p>Feedback</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <h4 className="mb-3">Colleges</h4>
          {colleges.length === 0 ? (
            <Alert variant="warning">No colleges found</Alert>
          ) : (
            colleges.map(college => (
              <Card key={college.id} className="mb-2">
                <Card.Body>
                  <h6>{college.name}</h6>
                  <p className="text-muted small">{college.location}</p>
                  <div>
                    <Badge bg="info">F: {college.facultyCount || 0}</Badge>
                    <Badge bg="success">S: {college.studentCount || 0}</Badge>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>

        <Col md={4}>
          <h4 className="mb-3">Users</h4>
          {users.length === 0 ? (
            <Alert variant="warning">No users found</Alert>
          ) : (
            users.map(user => (
              <Card key={user.id} className="mb-2">
                <Card.Body>
                  <h6>{user.name}</h6>
                  <p className="text-muted small">{user.email}</p>
                  <Badge bg={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'warning' : 'primary'}>
                    {user.role}
                  </Badge>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>

        <Col md={4}>
          <h4 className="mb-3">Recent Feedback</h4>
          {feedback.length === 0 ? (
            <Alert variant="warning">No feedback found</Alert>
          ) : (
            feedback.slice(0, 5).map(item => (
              <Card key={item.id} className="mb-2">
                <Card.Body>
                  <h6>Rating: {item.points}/10</h6>
                  <p className="text-muted small">{item.subject}</p>
                  <Badge bg="secondary">{item.collegeId || 'No college'}</Badge>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}
