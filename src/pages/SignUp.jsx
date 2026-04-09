// SignUp page for Smart Feedback Analyzer
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/FireBaseConfig";

const SignUp = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Default to URL role if present, otherwise default to empty or student
  const [role, setRole] = useState(roleFromUrl || "student");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const displayRole = roleFromUrl ? roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1) : "";

  // Hardcoded BVCEC college ID - will be set after BVCEC is added
  const BVCEC_COLLEGE_ID = "bvec-college-id"; // This will be updated after BVCEC is added

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const result = await signUp(email, password, name, role, BVCEC_COLLEGE_ID);
      
      if (result.success) {
        // Firebase automatically logs in the newly created user!
        // We can navigate them straight to their dashboard without an alert blocking them.
        switch (role) {
          case "student":
            navigate("/student");
            break;
          case "faculty":
            navigate("/faculty");
            break;
          case "admin":
            navigate("/admin");
            break;
          default:
            navigate("/home");
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center p-3">
        <Row className="justify-content-center w-100">
          <Col xs={12} sm={11} md={9} lg={7} xl={6}>
            <Card className="shadow-lg border-0 auth-card">
              <Card.Body className="p-5 p-md-6">
                <div className="text-center mb-4">
                  <h2 className="auth-title text-primary mb-2">
                    {displayRole ? `${displayRole} Sign Up` : "Sign Up"}
                  </h2>
                  <p className="text-muted">
                    {displayRole ? `Create your ${displayRole} account to get started` : "Create your account to get started"}
                  </p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSignup}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Hide Role Selector if it was passed cleanly from Landing Page */}
                  {!roleFromUrl && (
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="select">Select your role</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Administrator</option>
                      </Form.Select>
                    </Form.Group>
                  )}

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <Link to={roleFromUrl ? `/signin?role=${roleFromUrl}` : "/signin"} className="text-primary text-decoration-none">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;