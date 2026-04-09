import { useAuth } from "../context/AuthContext";
import { Container, Card, Row, Col, Badge, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Profile() {
  const { userProfile, user, loading } = useAuth();
  const navigate = useNavigate();

  // If unauthenticated after loading, redirect to sign-in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container className="py-5 text-center">
        <h4>User profile not found.</h4>
        <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
      </Container>
    );
  }

  const roleColors = {
    student: "primary",
    faculty: "success",
    admin: "danger"
  };

  return (
    <div className="profile-container">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-lg border-0 profile-card">
              <Card.Header className={`bg-${roleColors[userProfile.role] || 'secondary'} text-white py-4 text-center`}>
                <div className="profile-avatar mb-3 mx-auto bg-white text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold fs-1" style={{ width: '100px', height: '100px' }}>
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="mb-0">{userProfile.name}</h3>
                <Badge bg="light" text="dark" className="mt-2 fs-6 text-capitalize">
                  {userProfile.role}
                </Badge>
              </Card.Header>
              <Card.Body className="p-4">
                <ListGroup variant="flush">
                  <ListGroupItem>
                    <strong>Email:</strong> <span className="ms-2">{userProfile.email}</span>
                  </ListGroupItem>
                  {userProfile.collegeId && (
                    <ListGroupItem>
                      <strong>College ID:</strong> <span className="ms-2">{userProfile.collegeId}</span>
                    </ListGroupItem>
                  )}
                  {userProfile.branch && (
                    <ListGroupItem>
                      <strong>Branch:</strong> <span className="ms-2">{userProfile.branch}</span>
                    </ListGroupItem>
                  )}
                  <ListGroupItem>
                    <strong>Joined:</strong> <span className="ms-2">{userProfile.createdAt ? new Date(userProfile.createdAt.toDate?.() || userProfile.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </ListGroupItem>
                  <ListGroupItem>
                    <strong>Last Login:</strong> <span className="ms-2">{userProfile.lastLogin ? new Date(userProfile.lastLogin.toDate?.() || userProfile.lastLogin).toLocaleString() : 'First time'}</span>
                  </ListGroupItem>
                </ListGroup>
                
                <div className="text-center mt-4">
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    Go Back
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// Quick component shim for ListGroup
const ListGroup = ({ children, variant }) => <ul className={`list-group ${variant === 'flush' ? 'list-group-flush' : ''}`}>{children}</ul>;
const ListGroupItem = ({ children }) => <li className="list-group-item">{children}</li>;
