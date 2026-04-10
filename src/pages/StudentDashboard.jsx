import FeedbackForm from "../components/FeedbackForm";

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submit");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Minimal initial fetch - only what's needed for the current screen
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Fetch user's feedback submissions (usually small list)
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

        // 2. Fetch faculty if relevant (lazy or small batch)
        if (userProfile?.collegeId) {
          const usersQuery = query(
            collection(db, "users"),
            where("collegeId", "==", userProfile.collegeId),
            where("role", "==", "faculty")
          );
          const facultySnapshot = await getDocs(usersQuery);
          setFaculty(facultySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error in student dashboard first load:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userProfile?.collegeId]);

  const handleFeedbackSubmitted = () => {
    setSuccess("Feedback submitted successfully!");
    // Refresh feedback list
    const fetchFeedback = async () => {
      const q = query(collection(db, "feedback"), where("studentId", "==", user.uid));
      const snap = await getDocs(q);
      setFeedback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchFeedback();
    setActiveTab("history");
    setTimeout(() => setSuccess(""), 5000);
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg border-0 dashboard-card">
              <Card.Header className="bg-primary text-white py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0">Student Dashboard</h2>
                    <p className="mb-0">Your voice matters in improving education</p>
                  </div>
                  <Badge bg="light" text="dark" className="fs-6">
                    {feedback.length} submissions
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                <Form.Group className="mb-4">
                  <div className="btn-group w-100" role="group">
                    <Button
                      variant={activeTab === "submit" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("submit")}
                    >
                      Submit Feedback
                    </Button>
                    <Button
                      variant={activeTab === "history" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("history")}
                    >
                      History ({feedback.length})
                    </Button>
                    <Button
                      variant={activeTab === "college" ? "primary" : "outline-primary"}
                      onClick={() => setActiveTab("college")}
                    >
                      College Info
                    </Button>
                  </div>
                </Form.Group>

                {success && <Alert variant="success" className="mb-4">{success}</Alert>}
                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                {activeTab === "submit" && (
                  <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
                )}

                {activeTab === "history" && (
                  <div>
                    {feedback.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted mb-3">You haven't submitted any feedback yet.</p>
                        <Button variant="primary" onClick={() => setActiveTab("submit")}>
                          Give Your First Feedback
                        </Button>
                      </div>
                    ) : (
                      <ListGroup>
                        {feedback.map((item) => {
                          const facultyMember = faculty.find(f => f.id === item.facultyId);
                          return (
                            <ListGroup.Item key={item.id} className="mb-2 border rounded shadow-sm py-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1 text-primary">
                                    {item.faculty || facultyMember?.name || 'Faculty Member'}
                                  </h6>
                                  <div className="small text-muted mb-1">
                                    <Badge bg="secondary" className="me-2">{item.category || "General"}</Badge>
                                    {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <Badge bg={getRatingColor(item.points)} className="fs-6">
                                  {item.points}/10
                                </Badge>
                              </div>
                              <p className="mb-0 text-dark">{item.text || item.comment}</p>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    )}
                  </div>
                )}

                {activeTab === "college" && (
                  <div className="p-3 bg-light rounded shadow-sm">
                    <h5 className="mb-3 text-secondary">Campus Directory</h5>
                    <Row>
                      <Col md={6}>
                        <p><strong>College ID:</strong> {userProfile?.collegeId || "N/A"}</p>
                        <p><strong>Major/Branch:</strong> {userProfile?.branch || "General Studies"}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Total Faculty:</strong> {faculty.length}</p>
                      </Col>
                    </Row>
                  </div>
                )}

                <div className="text-center mt-4 pt-3 border-top">
                  <Button variant="outline-secondary" onClick={() => navigate('/home')}>
                    General Dashboard
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