import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useEffect, useState, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Card, ListGroup, Badge, Nav, ProgressBar, Alert } from "react-bootstrap";

export default function FacultyDashboard() {
  const [allFeedback, setAllFeedback] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (!auth.currentUser) return;
      
      // Fetch user profile if not already set (fallback)
      if (!user) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      }

      // Query feedback specifically where facultyId matches the current user
      const feedbackQuery = query(collection(db, "feedback"), where("facultyId", "==", auth.currentUser.uid));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      
      const myFeedbackData = feedbackSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp || new Date(doc.data().createdAt?.toDate?.() || doc.data().createdAt || Date.now()).toLocaleString()
      }));
      
      setMyFeedback(myFeedbackData);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Lazy load students when tab is switched
  useEffect(() => {
    const fetchStudents = async () => {
      // Only fetch if tab is active, students list is empty, and we have the collegeId
      if (activeTab === "students" && students.length === 0 && user?.collegeId) {
        try {
          const studentQuery = query(
            collection(db, "users"), 
            where("role", "==", "student"),
            where("collegeId", "==", user.collegeId)
          );
          const studentSnapshot = await getDocs(studentQuery);
          const studentsData = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setStudents(studentsData);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      }
    };
    
    fetchStudents();
  }, [activeTab, students.length, user?.collegeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  // Calculate statistics for my feedback
  const calculateStats = (feedbackList) => {
    if (feedbackList.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        categoryBreakdown: {},
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
      };
    }

    const totalRating = feedbackList.reduce((sum, f) => sum + (f.points || 0), 0);
    const avgRating = (totalRating / feedbackList.length).toFixed(1);

    const categoryBreakdown = {};
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

    feedbackList.forEach(f => {
      // Category breakdown
      const cat = f.category || "other";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

      // Rating distribution
      const rating = f.points || 1;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Calculate lowest category
    let lowestCategory = null;
    let lowestCategoryScore = 10;
    
    // Convert to average per category
    const categoryTotals = {};
    const categoryAverages = {};
    
    feedbackList.forEach(f => {
      const cat = f.category || "other";
      if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
      categoryTotals[cat].sum += (f.points || 0);
      categoryTotals[cat].count += 1;
    });
    
    Object.keys(categoryTotals).forEach(cat => {
      categoryAverages[cat] = categoryTotals[cat].sum / categoryTotals[cat].count;
      if (categoryAverages[cat] < lowestCategoryScore) {
        lowestCategoryScore = categoryAverages[cat];
        lowestCategory = cat;
      }
    });

    return {
      totalFeedback: feedbackList.length,
      averageRating: parseFloat(avgRating),
      categoryBreakdown,
      ratingDistribution,
      lowestCategory: lowestCategory,
      lowestCategoryScore: lowestCategoryScore.toFixed(1)
    };
  };

  const stats = calculateStats(myFeedback);

  const filteredFeedback = selectedCategory === "all" 
    ? myFeedback 
    : myFeedback.filter(f => f.category === selectedCategory);

  const getRatingBgColor = (rating) => {
    if (rating >= 8) return "success";
    if (rating >= 5) return "warning";
    return "danger";
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

  return (
    <div className="faculty-dashboard-container">
      <Container className="py-5 dashboard-content">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={9}>
            <Card className="shadow-lg border-0 dashboard-card">
              <Card.Header className="bg-success text-white py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0">Faculty Dashboard</h2>
                    <p className="mb-0">Monitor your student feedback and ratings</p>
                  </div>
                  <Badge bg="light" text="dark" className="fs-6">
                    {stats.totalFeedback} feedback received
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Navigation Tabs */}
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                      className="cursor-pointer"
                    >
                      📊 Overview
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === "feedback"}
                      onClick={() => setActiveTab("feedback")}
                      className="cursor-pointer"
                    >
                      💬 Feedback ({stats.totalFeedback})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === "students"}
                      onClick={() => setActiveTab("students")}
                      className="cursor-pointer"
                    >
                      👥 Students ({students.length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading feedback data...</p>
                  </div>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div>
                        {stats.totalFeedback === 0 ? (
                          <Alert variant="info" className="text-center">
                            No feedback received yet. Check back soon!
                          </Alert>
                        ) : (
                          <>
                            {/* Key Statistics */}
                            <Row className="mb-4">
                              <Col md={6} className="mb-3">
                                <Card className="border-light h-100">
                                  <Card.Body className="text-center">
                                    <h6 className="text-muted mb-3">Average Rating</h6>
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                      <h1 className="text-success mb-0">{stats.averageRating}</h1>
                                      <span className="text-muted">/10</span>
                                    </div>
                                    <div className="mt-3">
                                      <ProgressBar 
                                        now={(stats.averageRating / 10) * 100} 
                                        label={`${(stats.averageRating / 10) * 100}%`}
                                        variant="success"
                                      />
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>

                              <Col md={6} className="mb-3">
                                <Card className="border-light h-100">
                                  <Card.Body className="text-center">
                                    <h6 className="text-muted mb-3">Total Feedback</h6>
                                    <h1 className="text-primary mb-0">{stats.totalFeedback}</h1>
                                    <p className="text-muted small mt-3">
                                      responses from students
                                    </p>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>

                            {/* Category Breakdown */}
                            <div className="mb-4">
                              <h5 className="mb-3">Feedback by Category</h5>
                              <Row>
                                {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                                  <Col md={6} lg={4} key={category} className="mb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <div>
                                        <Badge bg={getCategoryBadgeColor(category)}>
                                          {category}
                                        </Badge>
                                      </div>
                                      <span className="badge bg-secondary">{count}</span>
                                    </div>
                                    <ProgressBar 
                                      now={(count / stats.totalFeedback) * 100}
                                      variant={getCategoryBadgeColor(category)}
                                    />
                                  </Col>
                                ))}
                              </Row>
                            </div>

                            {/* Rating Distribution */}
                            <div>
                              <h5 className="mb-3">Rating Distribution</h5>
                              <div className="rating-distribution">
                                {Object.entries(stats.ratingDistribution).map(([rating, count]) => (
                                  count > 0 && (
                                    <div key={rating} className="mb-2 d-flex align-items-center gap-2">
                                      <small style={{ minWidth: "30px" }}>
                                        <strong>{rating}⭐</strong>
                                      </small>
                                      <ProgressBar 
                                        now={(count / stats.totalFeedback) * 100}
                                        style={{ minHeight: "20px" }}
                                        className="flex-grow-1"
                                      />
                                      <small className="text-muted" style={{ minWidth: "30px" }}>
                                        {count}
                                      </small>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>

                            {/* Optional Areas for Improvement */}
                            {stats.lowestCategory && stats.lowestCategoryScore < 7 && (
                              <div className="mt-4">
                                <Alert variant="warning">
                                  <Alert.Heading>Areas for Improvement</Alert.Heading>
                                  <p>
                                    Based on student feedback, your lowest scoring category is <strong>{stats.lowestCategory}</strong> with an average score of <strong>{stats.lowestCategoryScore}/10</strong>.
                                  </p>
                                  <hr />
                                  <p className="mb-0 text-muted small">
                                    Consider reviewing feedback specifically categorized under <span className="text-capitalize fw-bold">{stats.lowestCategory}</span> to understand student concerns.
                                  </p>
                                </Alert>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Feedback Tab */}
                    {activeTab === "feedback" && (
                      <div>
                        {stats.totalFeedback === 0 ? (
                          <Alert variant="info" className="text-center">
                            No feedback received yet. Check back later!
                          </Alert>
                        ) : (
                          <>
                            {/* Category Filter */}
                            <div className="mb-4">
                              <h6 className="mb-3">Filter by Category</h6>
                              <div className="d-flex flex-wrap gap-2">
                                <Badge 
                                  bg={selectedCategory === "all" ? "success" : "light"}
                                  text={selectedCategory === "all" ? "white" : "dark"}
                                  className="cursor-pointer p-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setSelectedCategory("all")}
                                >
                                  All ({myFeedback.length})
                                </Badge>
                                {Object.keys(stats.categoryBreakdown).map(category => (
                                  <Badge 
                                    key={category}
                                    bg={selectedCategory === category ? getCategoryBadgeColor(category) : "light"}
                                    text={selectedCategory === category ? "white" : "dark"}
                                    className="cursor-pointer p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setSelectedCategory(category)}
                                  >
                                    {category} ({stats.categoryBreakdown[category]})
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Feedback List */}
                            <div>
                              <h6 className="mb-3">
                                {selectedCategory === "all" ? "All Feedback" : `${selectedCategory} Feedback`}
                                <Badge bg="secondary" className="ms-2">{filteredFeedback.length}</Badge>
                              </h6>
                              
                              {filteredFeedback.length === 0 ? (
                                <Alert variant="light" className="text-center text-muted">
                                  No feedback in this category.
                                </Alert>
                              ) : (
                                <ListGroup variant="flush">
                                  {filteredFeedback.map((item, index) => (
                                    <ListGroup.Item key={item.id} className="py-3 border-light">
                                      <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div className="flex-grow-1">
                                          <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex gap-2 align-items-center">
                                              <Badge bg={getRatingBgColor(item.points)} className="fs-6">
                                                {item.points}/10
                                              </Badge>
                                              <Badge bg={getCategoryBadgeColor(item.category)}>
                                                {item.category}
                                              </Badge>
                                            </div>
                                            <small className="text-muted">
                                              {item.timestamp}
                                            </small>
                                          </div>
                                          <p className="mb-0 text-break">{item.text}</p>
                                        </div>
                                        <Badge bg="secondary" className="mt-1">
                                          #{filteredFeedback.length - index}
                                        </Badge>
                                      </div>
                                    </ListGroup.Item>
                                  ))}
                                </ListGroup>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === "students" && (
                      <div>
                        <h5 className="mb-4">Student Details & Ratings</h5>
                        {students.length === 0 ? (
                          <Alert variant="info" className="text-center">
                            No students found in the system.
                          </Alert>
                        ) : (
                          <Row>
                            {students.map((student) => {
                              const studentFeedback = myFeedback.filter(f => 
                                f.studentName && f.studentName.toLowerCase().includes(student.name.toLowerCase())
                              );
                              const avgRating = studentFeedback.length > 0 
                                ? (studentFeedback.reduce((sum, f) => sum + (f.points || 0), 0) / studentFeedback.length).toFixed(1)
                                : 0;
                              
                              return (
                                <Col md={6} lg={4} key={student.id} className="mb-3">
                                  <Card className="h-100 border-light">
                                    <Card.Body>
                                      <div className="text-center mb-3">
                                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                             style={{ width: '50px', height: '50px' }}>
                                          {student.name?.trim()?.[0]?.toUpperCase() || 'S'}
                                        </div>
                                        <h6 className="mb-1">{student.name}</h6>
                                        <Badge bg="secondary" className="mb-2">{student.email}</Badge>
                                      </div>
                                      
                                      <div className="text-center">
                                        <div className="mb-2">
                                          <small className="text-muted">Average Rating</small>
                                          <div className="d-flex align-items-center justify-content-center gap-1">
                                            <h5 className={`mb-0 text-${avgRating >= 7 ? 'success' : avgRating >= 5 ? 'warning' : 'danger'}`}>
                                              {avgRating || 'N/A'}
                                            </h5>
                                            <small className="text-muted">/10</small>
                                          </div>
                                        </div>
                                        
                                        <div className="mb-2">
                                          <small className="text-muted">Feedback Count</small>
                                          <div>
                                            <Badge bg="info">{studentFeedback.length}</Badge>
                                          </div>
                                        </div>
                                        
                                        <div className="mb-2">
                                          <small className="text-muted">Branch</small>
                                          <div>
                                            <Badge bg="secondary">{student.branch || 'Not specified'}</Badge>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <small className="text-muted">Last Active</small>
                                          <div>
                                            <small>
                                              {student.lastLogin 
                                                ? new Date(student.lastLogin.toDate?.() || student.lastLogin).toLocaleDateString()
                                                : 'Never'
                                              }
                                            </small>
                                          </div>
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Logout Button */}
                <div className="text-center mt-4 pt-3 border-top">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleLogout}
                    className="px-4"
                  >
                    Logout
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