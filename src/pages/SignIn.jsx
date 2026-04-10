import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  // Get role from URL query param
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get("role");
  
  // Capitalize role for display (e.g., student -> Student)
  const displayRole = roleFromUrl ? roleFromUrl.charAt(0).toUpperCase() + roleFromUrl.slice(1) : "";

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // PROACTIVE CACHE: Save intent so onAuthStateChanged can bypass loading instantly
      if (roleFromUrl) localStorage.setItem("role", roleFromUrl);
      
      const result = await signIn(email, password);
      
      if (result.success) {
        // Navigate based on role
        switch (result.user.role) {
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
            setError("Invalid user role. Please contact administrator.");
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
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 auth-card">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="auth-title text-primary mb-2">
                    {displayRole ? `${displayRole} Sign In` : "Smart Feedback"}
                  </h2>
                  <p className="text-muted">
                    {displayRole ? `Welcome to the ${displayRole} Portal` : "Welcome to Smart Feedback Analyzer"}
                  </p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSignin}>
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <Link to={roleFromUrl ? `/signup?role=${roleFromUrl}` : "/signup"} className="text-primary text-decoration-none">
                      Sign Up
                    </Link>
                  </p>
                  {!roleFromUrl && (
                    <p className="mb-0 mt-2">
                      Are you an admin?{" "}
                      <Link to="/signin?role=admin" className="text-primary text-decoration-none">
                        Admin Login
                      </Link>
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignIn;