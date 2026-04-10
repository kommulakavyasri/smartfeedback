import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Card, Badge, Spinner, Button, Collapse } from "react-bootstrap";
import FeedbackForm from "../components/FeedbackForm";

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const q = query(
        collection(db, "feedback"),
        where("studentId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setFeedback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFeedbackSubmitted = () => {
    setSuccess("Thank you! Your feedback has been recorded.");
    fetchData();
    setTimeout(() => setSuccess(""), 5000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  return (
    <div className="student-portal-v2 py-5 bg-light min-vh-100">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 className="fw-bold text-primary">Student Portal</h1>
              <p className="text-muted">Direct Feedback Channel</p>
            </div>

            {/* Primary Feedback Form */}
            <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />

            {/* History Toggle */}
            <div className="text-center mt-5">
              <Button 
                variant="outline-secondary" 
                className="rounded-pill px-4 shadow-sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide Submission History" : `View Past Feedback (${feedback.length})`}
              </Button>
            </div>

            {/* Collapsible History Section */}
            <Collapse in={showHistory}>
              <div className="mt-4">
                {feedback.length === 0 ? (
                  <Card className="text-center p-5 border-0 shadow-sm">
                    <p className="text-muted mb-0">No history found yet.</p>
                  </Card>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {feedback.map((item) => (
                      <Card key={item.id} className="border-0 shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 fw-bold">{item.faculty}</h6>
                            <Badge bg="info" className="mb-2">{item.category}</Badge>
                            <p className="small text-dark mb-0">{item.text || item.comment}</p>
                          </div>
                          <Badge bg="primary" className="fs-6">
                            {item.points}/10
                          </Badge>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Collapse>

            <div className="text-center mt-5 opacity-50">
              <Button variant="link" onClick={() => navigate('/home')} className="text-dark text-decoration-none">
                ← Back to Campus Home
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}