import { useAuth } from "../context/AuthContext";
import { Container, Card, Row, Col, Badge, Spinner, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Profile() {
  const { userProfile, user, loading } = useAuth();
  const navigate = useNavigate();

  // If unauthenticated after loading, redirect to sign-in
  useEffect(() => {
    if (!loading && !user) navigate("/signin");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="grow" variant="primary" />
      </Container>
    );
  }

  if (!userProfile && user) {
     // If we are logged in but profile is lagging, show fallback
  } else if (!userProfile) {
    return (
      <Container className="py-5 text-center">
        <h4>User profile still loading or not found.</h4>
        <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
      </Container>
    );
  }

  const roleColors = {
    student: "primary",
    faculty: "success",
    admin: "danger"
  };

  const effectiveRole = userProfile?.role || localStorage.getItem("role");
  const displayName = userProfile?.name || user?.email || "User";

  return (
    <div className="profile-container vh-100 bg-light">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Header className={`bg-${roleColors[effectiveRole] || 'secondary'} text-white py-4 text-center`}>
                <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold fs-1 mx-auto mb-3 shadow" style={{ width: '80px', height: '80px' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="mb-0">{displayName}</h3>
                <Badge bg="light" text="dark" className="mt-2 fs-6 text-capitalize">
                  {effectiveRole}
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item className="py-3">
                    <small className="text-muted d-block text-uppercase fw-bold">Email Address</small>
                    <span className="fs-6">{userProfile?.email || user?.email}</span>
                  </ListGroup.Item>
                  {userProfile?.collegeId && (
                    <ListGroup.Item className="py-3">
                      <small className="text-muted d-block text-uppercase fw-bold">Institutional Affiliation</small>
                      <span className="fs-6">{userProfile.collegeId}</span>
                    </ListGroup.Item>
                  )}
                  {userProfile?.branch && (
                    <ListGroup.Item className="py-3">
                      <small className="text-muted d-block text-uppercase fw-bold">Department / Branch</small>
                      <span className="fs-6">{userProfile.branch}</span>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="py-3">
                    <small className="text-muted d-block text-uppercase fw-bold">Account Created</small>
                    <span className="fs-6">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate?.() || userProfile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
                
                <div className="p-4 text-center bg-white border-top">
                  <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => navigate(-1)}>
                    ← Back to Previous
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
