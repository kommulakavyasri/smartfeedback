import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // If already logged in, redirect to the appropriate dashboard
  useEffect(() => {
    const role = userProfile?.role || localStorage.getItem("role");
    if (user && role) {
      if (role === "student") navigate("/student");
      else if (role === "faculty") navigate("/faculty");
      else if (role === "admin") navigate("/admin");
      else navigate("/home");
    }
  }, [user, userProfile, navigate]);

  const handleSelectRole = (role) => {
    navigate(`/signin?role=${role}`);
  };

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <Container>
          <div className="text-center">
            <h1 className="landing-title display-4">Smart Feedback Analyzer</h1>
            <p className="landing-subtitle">Welcome! Please select your portal to continue.</p>
          </div>

          <Row className="justify-content-center mt-5 g-4">
            {/* Student Portal Card */}
            <Col xs={12} md={5} lg={4}>
              <Card 
                className="portal-card student-portal shadow-lg"
                onClick={() => handleSelectRole("student")}
              >
                <Card.Body className="p-5 text-center d-flex flex-column justify-content-center">
                  <div className="portal-icon-wrapper">
                    🎓
                  </div>
                  <h3 className="fw-bold mb-3">Student Portal</h3>
                  <p className="text-muted mb-0">
                    Log in to submit feedback for your faculty, view your past submissions, and help improve the learning experience.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Faculty Portal Card */}
            <Col xs={12} md={5} lg={4}>
              <Card 
                className="portal-card faculty-portal shadow-lg"
                onClick={() => handleSelectRole("faculty")}
              >
                <Card.Body className="p-5 text-center d-flex flex-column justify-content-center">
                  <div className="portal-icon-wrapper">
                    👨‍🏫
                  </div>
                  <h3 className="fw-bold mb-3">Faculty Portal</h3>
                  <p className="text-muted mb-0">
                    Log in to review your feedback, track your performance, and understand student perspectives.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center mt-5 pt-5">
            <a href="/admin/login" className="admin-link mx-3" onClick={(e) => { e.preventDefault(); handleSelectRole("admin"); }}>
              Admin Login
            </a>
            <span className="text-muted opacity-50">|</span>
            <a href="/signup" className="admin-link mx-3">
              Don't have an account? Sign Up
            </a>
          </div>
        </Container>
      </div>
    </div>
  );
}
