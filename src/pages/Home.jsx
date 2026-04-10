import { useState, useEffect } from 'react';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../firebase/FireBaseConfig.jsx';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Container,
  Row,
  Col,
  Badge,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';

export default function Home() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalFeedback: 0,
    avgRating: 4.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch colleges
      const collegesSnapshot = await getDocs(collection(db, 'colleges'));
      const collegesData = collegesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColleges(collegesData);

      // Fast counts via getCountFromServer with fallback
      try {
        const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
        const facultyQuery = query(collection(db, 'users'), where('role', '==', 'faculty'));
        const feedbackQuery = collection(db, 'feedback');
        
        const [studentsCount, facultyCount, feedbackCountSnapshot] = await Promise.all([
          getCountFromServer(studentQuery).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(facultyQuery).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(feedbackQuery).catch(() => ({ data: () => ({ count: 0 }) }))
        ]);

        setStats({
          totalColleges: collegesData.length,
          totalStudents: studentsCount.data().count,
          totalFaculty: facultyCount.data().count,
          totalFeedback: feedbackCountSnapshot.data().count,
          avgRating: 4.8
        });
      } catch (countError) {
        console.warn("Could not fetch full stats, using defaults:", countError);
        setStats(prev => ({ ...prev, totalColleges: collegesData.length }));
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const FeatureCard = ({ icon, title, description, color }) => (
    <Col md={4} className="mb-4">
      <Card className="h-100 border-0 shadow-sm transition-hover">
        <Card.Body className="text-center p-4">
          <div className={`rounded-circle bg-${color} bg-opacity-10 text-${color} p-3 d-inline-block mb-3`} style={{ width: '60px', height: '60px' }}>
            <i className={`bi bi-${icon} fs-4`}></i>
          </div>
          <h5>{title}</h5>
          <p className="text-muted small mb-0">{description}</p>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  return (
    <div className="home-page-v2">
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5 mb-5 shadow-sm">
        <Container className="py-4">
          <Row className="align-items-center">
            <Col lg={7} className="text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-3">Elevate Academic Excellence Through Feedback</h1>
              <p className="lead mb-4 opacity-75">
                Smart Feedback Analyzer bridges the gap between students and faculty, 
                turning insights into actionable improvements.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                {!user ? (
                  <>
                    <Button variant="light" size="lg" onClick={() => navigate('/signup')}>
                      Get Started
                    </Button>
                    <Button variant="outline-light" size="lg" onClick={() => navigate('/signin')}>
                      Login
                    </Button>
                  </>
                ) : (
                  <Button variant="light" size="lg" onClick={() => {
                    const role = userProfile?.role;
                    if (role === 'student') navigate('/student');
                    else if (role === 'faculty') navigate('/faculty');
                    else if (role === 'admin') navigate('/admin');
                    else navigate('/profile');
                  }}>
                    Go to Your Dashboard
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div className="hero-stats bg-white bg-opacity-10 rounded-4 p-4 backdrop-blur">
                <Row className="text-center g-3">
                  <Col xs={6}>
                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h3 className="mb-0">{stats.totalFeedback}</h3>
                      <small className="opacity-75">Feedbacks</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h3 className="mb-0">{stats.totalFaculty}</h3>
                      <small className="opacity-75">Faculty</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h3 className="mb-0">{stats.totalStudents}</h3>
                      <small className="opacity-75">Students</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h3 className="mb-0">{stats.avgRating}⭐</h3>
                      <small className="opacity-75">Avg Rating</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Features Section */}
        <div className="mb-5 pb-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Use Smart Feedback?</h2>
            <p className="text-muted">A comprehensive platform for academic growth</p>
          </div>
          <Row>
            <FeatureCard 
              icon="shield-check" 
              title="Secure & Private" 
              description="Your identity is protected while providing constructive criticism ensuring honest and helpful insights."
              color="primary"
            />
            <FeatureCard 
              icon="graph-up-arrow" 
              title="Real-time Analytics" 
              description="Powerful dashboards for faculty and administrators to track performance trends and student satisfaction."
              color="success"
            />
            <FeatureCard 
              icon="clock-history" 
              title="Instant Impact" 
              description="Fast submission process and immediate data updates allow for quicker implementation of improvements."
              color="info"
            />
          </Row>
        </div>

        {/* How It Works */}
        <div className="bg-light rounded-5 p-5 mb-5 shadow-sm border">
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="fw-bold mb-4">How it Works</h2>
              <div className="d-flex mb-4">
                <div className="me-3 fs-3 text-primary fw-bold">01</div>
                <div>
                  <h6>Create Account</h6>
                  <p className="text-muted small">Sign up as a student or faculty using your college institutional email.</p>
                </div>
              </div>
              <div className="d-flex mb-4">
                <div className="me-3 fs-3 text-primary fw-bold">02</div>
                <div>
                  <h6>Share Feedback</h6>
                  <p className="text-muted small">Students provide ratings and detailed comments about teaching and course content.</p>
                </div>
              </div>
              <div className="d-flex mb-0">
                <div className="me-3 fs-3 text-primary fw-bold">03</div>
                <div>
                  <h6>Analyze & Improve</h6>
                  <p className="text-muted small">Faculty receive insights to adapt their teaching styles and enhance student learning.</p>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-center d-none d-md-block">
              <Card className="border-0 shadow-lg p-3 bg-white rotate-3">
                <Card.Body>
                  <h6 className="text-primary mb-3">Community Snapshot</h6>
                  <Row className="g-2 text-center">
                    {colleges.slice(0, 4).map(c => (
                      <Col xs={6} key={c.id}>
                        <div className="p-2 border rounded bg-light">
                          <small className="d-block text-truncate fw-bold">{c.name}</small>
                          <small className="text-muted">{c.location}</small>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center py-5">
            <h3 className="mb-4">Ready to start improving your campus?</h3>
            <Button variant="primary" size="lg" className="px-5 shadow" onClick={() => navigate('/signup')}>
              Join Now
            </Button>
          </div>
        )}
      </Container>
      
      <footer className="bg-white border-top py-4 mt-5">
        <Container className="text-center">
          <p className="text-muted mb-0">© 2026 Smart Feedback Analyzer. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}