import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container, Row, Col } from "react-bootstrap";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  const goToDashboard = () => {
    const role = localStorage.getItem("role");
    if (role === "student") {
      navigate("/student");
    } else if (role === "faculty") {
      navigate("/faculty");
    }
  };

  return (
    <div className="home-container">
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay" />

      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row>
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5 text-center">
                <h2 className="welcome-title text-primary mb-3">Welcome to SMART</h2>
                <h4 className="user-email text-muted mb-4">{user?.email}</h4>
                
                <p className="mb-4">
                  Your gateway to student feedback and faculty insights. 
                  Access your personalized dashboard to share feedback or view student responses.
                </p>

                <div className="d-grid gap-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={goToDashboard}
                    className="py-3"
                  >
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    size="lg" 
                    onClick={handleSignOut}
                    className="py-3"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;