import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useEffect, useState, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Card, ListGroup, Badge, Nav, ProgressBar, Alert, Table, Tabs, Tab } from "react-bootstrap";
import AnalyticsChart from "../components/AnalyticsChart";
import BranchComparison from "../components/BranchComparison";

export default function AdminDashboard() {
  const [allFeedback, setAllFeedback] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMainTab, setActiveMainTab] = useState("analytics");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [feedbackSnapshot, collegesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, "feedback")),
        getDocs(collection(db, "colleges")),
        getDocs(collection(db, "users"))
      ]);

      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || new Date(doc.data().createdAt?.toDate?.() || doc.data().createdAt).toLocaleString()
      }));
      setAllFeedback(feedbackData);

      const collegesData = collegesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColleges(collegesData);

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analytics = calculateAnalytics();

  function calculateAnalytics() {
    const totalFeedback = allFeedback.length;
    const totalRating = allFeedback.reduce((sum, f) => sum + (f.points || 0), 0);
    const averageRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(1) : 0;

    const categoryBreakdown = {};
    allFeedback.forEach(f => {
      const cat = f.category || "other";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    allFeedback.forEach(f => {
      const rating = f.points || 1;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    return {
      totalFeedback,
      averageRating: parseFloat(averageRating),
      categoryBreakdown,
      ratingDistribution
    };
  }

  // Calculate faculty averages
  const getFacultyStats = () => {
    const facultyFeedback = {};
    allFeedback.forEach(f => {
      // f.facultyId is now present, fallback to f.faculty (name) if needed for old records
      const facultyIdentifier = f.facultyId || f.faculty || 'unknown';
      if (!facultyFeedback[facultyIdentifier]) facultyFeedback[facultyIdentifier] = { total: 0, count: 0, name: f.faculty || 'Unknown', college: f.collegeId || 'Unknown' };
      facultyFeedback[facultyIdentifier].total += (f.points || 0);
      facultyFeedback[facultyIdentifier].count += 1;
    });

    const faculties = users.filter(u => u.role === 'faculty').map(fac => {
      const fb = facultyFeedback[fac.id] || facultyFeedback[fac.name] || { total: 0, count: 0 };
      const avg = fb.count > 0 ? (fb.total / fb.count).toFixed(1) : "0.0";
      return { ...fac, avgRating: parseFloat(avg), feedbackCount: fb.count };
    });

    // Sort descending by average rating
    faculties.sort((a, b) => b.avgRating - a.avgRating);
    return faculties;
  };

  const facultyStats = getFacultyStats();
  const topFaculty = facultyStats.length > 0 ? facultyStats[0] : null;

  const getRatingColor = (rating) => {
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
    <div className="admin-dashboard-container">
      <Container className="py-5 dashboard-content">
        <Row className="justify-content-center">
          <Col xs={12} md={11} lg={10}>
            <Card className="shadow-lg border-0 dashboard-card">
              <Card.Header className="bg-danger text-white py-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-0">Admin Dashboard</h2>
                    <p className="mb-0">System-wide feedback analytics and faculty comparison</p>
                  </div>
                  <Badge bg="light" text="dark" className="fs-6">
                    {analytics.totalFeedback} total feedback
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                <Tabs
                  activeKey={activeMainTab}
                  onSelect={(k) => setActiveMainTab(k)}
                  className="mb-4"
                >
                  <Tab eventKey="analytics" title="Analytics">
                    <AnalyticsChart data={allFeedback} />
                  </Tab>
                  <Tab eventKey="colleges" title={`Colleges (${colleges.length})`}>
                    <div>
                      <h4 className="mb-4">Registered Colleges</h4>
                      {colleges.length === 0 ? (
                        <Alert variant="info">
                          No colleges registered yet. Add BVCEC college using the admin tools.
                        </Alert>
                      ) : (
                        <Row>
                          {colleges.map((college) => (
                            <Col md={6} lg={4} key={college.id} className="mb-3">
                              <Card className="h-100 border-light">
                                <Card.Body>
                                  <h5 className="text-primary mb-2">{college.name}</h5>
                                  <p className="text-muted small mb-2">{college.location}</p>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Badge bg="info">
                                      Faculty: {college.facultyCount || 0}
                                    </Badge>
                                    <Badge bg="success">
                                      Students: {college.studentCount || 0}
                                    </Badge>
                                  </div>
                                  <p className="text-muted small mb-0">
                                    {college.description?.substring(0, 80)}...
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  </Tab>
                  <Tab eventKey="branches" title="Branch Comparison">
                    <BranchComparison />
                  </Tab>
                  <Tab eventKey="faculty-comparison" title="Faculty Comparison">
                    <div className="mt-4">
                      <h4 className="mb-4">Faculty Rankings & Comparison</h4>
                      {facultyStats.length === 0 ? (
                        <Alert variant="warning">No faculty data available.</Alert>
                      ) : (
                        <Row>
                          <Col md={12} className="mb-4">
                            <Card className="bg-success text-white">
                              <Card.Body>
                                <h5>🏆 Best Performing Faculty</h5>
                                {topFaculty && topFaculty.avgRating > 0 ? (
                                  <div className="d-flex align-items-center">
                                    <h1 className="me-3 mb-0">{topFaculty.avgRating}/10</h1>
                                    <div>
                                      <strong>{topFaculty.name}</strong><br />
                                      from College ID: {topFaculty.collegeId}<br/>
                                      Based on {topFaculty.feedbackCount} feedback responses.
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mb-0">No feedback submitted yet.</p>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                          
                          <Col md={12}>
                            <Table striped bordered hover responsive>
                              <thead>
                                <tr>
                                  <th>Rank</th>
                                  <th>Faculty Name</th>
                                  <th>Email</th>
                                  <th>College ID</th>
                                  <th>Avg Rating</th>
                                  <th>Feedback Count</th>
                                  <th>Performance vs Best</th>
                                </tr>
                              </thead>
                              <tbody>
                                {facultyStats.map((fac, index) => {
                                  const pct = topFaculty && topFaculty.avgRating > 0 
                                              ? (fac.avgRating / topFaculty.avgRating) * 100 
                                              : 0;
                                  return (
                                    <tr key={fac.id || index}>
                                      <td>#{index + 1}</td>
                                      <td>{fac.name}</td>
                                      <td>{fac.email}</td>
                                      <td>{fac.collegeId}</td>
                                      <td>
                                        <Badge bg={getRatingColor(fac.avgRating)}>
                                          {fac.avgRating}/10
                                        </Badge>
                                      </td>
                                      <td>{fac.feedbackCount}</td>
                                      <td className="align-middle">
                                        <ProgressBar 
                                          now={pct} 
                                          variant={pct > 80 ? 'success' : pct > 50 ? 'warning' : 'danger'} 
                                          label={`${pct.toFixed(0)}%`}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </Col>
                        </Row>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
