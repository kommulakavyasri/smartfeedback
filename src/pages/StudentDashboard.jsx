// Student Dashboard for Smart Feedback Analyzer
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Card, ListGroup, Badge, Alert, Spinner, Form } from "react-bootstrap";

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submit");
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback form state
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("teaching"); // NEW CATEGORY STATE
  const [comment, setComment] = useState("");
  const [points, setPoints] = useState(5);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userProfile?.collegeId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch faculty from same college
        const usersQuery = query(
          collection(db, "users"),
          where("collegeId", "==", userProfile.collegeId),
          where("role", "==", "faculty")
        );
        const facultySnapshot = await getDocs(usersQuery);
        const facultyData = facultySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFaculty(facultyData);

        // Fetch user's feedback submissions
        const feedbackQuery = query(
          collection(db, "feedback"),
          where("studentId", "==", user.uid)
        );
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });
        setFeedback(feedbackData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userProfile]);

  // Handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!selectedFaculty || !subject || !comment) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        studentId: user.uid,
        facultyId: selectedFaculty,
        collegeId: userProfile.collegeId,
        subject: subject,
        category: category, // SAVE CATEGORY
        comment: comment,
        points: points,
        createdAt: new Date()
      });

      setSuccess("Feedback submitted successfully!");
      // Reset form
      setSelectedFaculty("");
      setSubject("");
      setCategory("teaching"); // RESET CATEGORY
      setComment("");
      setPoints(5);
      
      // Refresh feedback list
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("studentId", "==", user.uid)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      teaching: "primary",
      content: "info",
      communication: "warning",
      support: "success",
      other: "secondary"
    };
    return colors[category] || "secondary";
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-primary text-white py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0">Student Dashboard</h2>
                    <p className="mb-0">Share feedback to help faculty improve</p>
                  </div>
                  <Badge bg="light" text="dark" className="fs-6">
                    {feedback.length} submitted
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Navigation Tabs */}
                <Form.Group className="mb-4">
                  <div className="btn-group w-100" role="group">
                    <Button
                      variant={activeTab === "home" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("home")}
                      className="w-33"
                    >
                      College Home
                    </Button>
                    <Button
                      variant={activeTab === "submit" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("submit")}
                      className="w-33"
                    >
                      Submit Feedback
                    </Button>
                    <Button
                      variant={activeTab === "history" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("history")}
                      className="w-33"
                    >
                      Your Feedback ({feedback.length})
                    </Button>
                  </div>
                </Form.Group>

                {/* College Home Tab */}
                {activeTab === "home" && (
                  <div>
                    <h4 className="mb-4 text-center">College Directory</h4>
                    <Row>
                      <Col md={12} className="mb-4">
                        <Card className="bg-light">
                          <Card.Body>
                            <h5 className="text-primary"><i className="bi bi-building"></i> Current College</h5>
                            <p className="mb-0"><strong>College ID:</strong> {userProfile?.collegeId || "Not assigned"}</p>
                            <p className="mb-0"><strong>Your Branch:</strong> {userProfile?.branch || "Not specified"}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <h5 className="mb-3">Faculty Directory</h5>
                    {faculty.length === 0 ? (
                      <Alert variant="warning">No faculty found in your college.</Alert>
                    ) : (
                      <Row>
                        {faculty.map((fac) => (
                          <Col md={6} key={fac.id} className="mb-3">
                            <Card className="h-100 border-0 shadow-sm">
                              <Card.Body className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style={{width: '50px', height: '50px'}}>
                                  {fac.name?.charAt(0) || 'F'}
                                </div>
                                <div>
                                  <h6 className="mb-1">{fac.name}</h6>
                                  <Badge bg="secondary" className="me-1">{fac.department || "Faculty"}</Badge>
                                </div>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="ms-auto"
                                  onClick={() => {
                                    setSelectedFaculty(fac.id);
                                    setActiveTab("submit");
                                  }}
                                >
                                  Rate
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                )}

                {/* Submit Feedback Tab */}
                {activeTab === "submit" && (
                  <div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Form onSubmit={handleSubmitFeedback}>
                      <Form.Group className="mb-3">
                        <Form.Label>Select Faculty</Form.Label>
                        {faculty.length === 0 ? (
                          <Alert variant="warning">
                            <Alert.Heading>No Faculty Available</Alert.Heading>
                            <p className="mb-2">
                              There are no faculty members in the system yet. 
                              Please ask the administrator to add faculty members first.
                            </p>
                            <Button 
                              variant="outline-warning" 
                              size="sm"
                              onClick={() => window.open('/add-faculty', '_blank')}
                            >
                              Add Faculty Members
                            </Button>
                          </Alert>
                        ) : (
                          <Form.Select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            required
                          >
                            <option value="">Choose faculty member...</option>
                            {faculty.map((fac) => (
                              <option key={fac.id} value={fac.id}>
                                {fac.name}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Subject</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                        >
                          <option value="teaching">Teaching Quality</option>
                          <option value="content">Course Content</option>
                          <option value="communication">Communication</option>
                          <option value="support">Student Support</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Rating (1-10)</Form.Label>
                        <Form.Range
                          min="1"
                          max="10"
                          value={points}
                          onChange={(e) => setPoints(parseInt(e.target.value))}
                          className="mb-2"
                        />
                        <div className="text-center">
                          <Badge bg={getRatingColor(points)} className="fs-6">
                            {points}/10
                          </Badge>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Share your detailed feedback..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-100"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Feedback"
                        )}
                      </Button>
                    </Form>
                  </div>
                )}

                {/* Feedback History Tab */}
                {activeTab === "history" && (
                  <div>
                    {feedback.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted mb-3">No feedback submitted yet.</p>
                        <Button
                          variant="primary"
                          onClick={() => setActiveTab("submit")}
                        >
                          Submit Your First Feedback
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted mb-3">
                          Here's a record of all feedback you've submitted.
                        </p>
                        <ListGroup>
                          {feedback.map((item) => {
                            const facultyMember = faculty.find(f => f.id === item.facultyId);
                            return (
                              <ListGroup.Item key={item.id} className="mb-2">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1">
                                      {facultyMember?.name || 'Unknown Faculty'}
                                    </h6>
                                    <div className="small text-muted">
                                      {item.subject}
                                    </div>
                                    <div className="small text-muted">
                                      {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <Badge bg={getRatingColor(item.points)} className="me-2">
                                      {item.points}/10
                                    </Badge>
                                  </div>
                                </div>
                                <p className="mb-0 text-break">{item.comment}</p>
                              </ListGroup.Item>
                            );
                          })}
                        </ListGroup>
                      </div>
                    )}
                  </div>
                )}

                {/* Logout Button */}
                <div className="text-center mt-4 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/home')}
                    className="px-4"
                  >
                    Back to Home
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