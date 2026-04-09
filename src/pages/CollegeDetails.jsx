import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/FireBaseConfig';
import { 
  Card, 
  Container, 
  Row, 
  Col, 
  Badge, 
  Button, 
  Alert, 
  Spinner,
  ListGroup,
  ProgressBar
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function CollegeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  const [college, setCollege] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCollegeDetails();
  }, [id]);

  const fetchCollegeDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch college details
      const collegeDoc = await getDoc(doc(db, 'colleges', id));
      if (collegeDoc.exists()) {
        const collegeData = { id: collegeDoc.id, ...collegeDoc.data() };
        setCollege(collegeData);
        
        // Fetch faculty and students for this college
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const collegeFaculty = usersData.filter(u => 
          u.role === 'faculty' && u.college === collegeData.name
        );
        const collegeStudents = usersData.filter(u => 
          u.role === 'student' && u.college === collegeData.name
        );
        
        setFaculty(collegeFaculty);
        setStudents(collegeStudents);
        
        // Fetch feedback for this college
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
        const feedbackData = feedbackSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          timestamp: doc.data().timestamp || new Date(doc.data().createdAt?.toDate?.() || doc.data().createdAt).toLocaleString()
        }));
        
        // Filter feedback related to this college's faculty
        const collegeFeedback = feedbackData.filter(f => {
          const facultyMember = collegeFaculty.find(fac => 
            f.name === f.faculty
          );
          return facultyMember;
        });
        
        setFeedback(collegeFeedback);
      } else {
        setError('College not found');
      }
    } catch (err) {
      console.error('Error fetching college details:', err);
      setError('Failed to load college details');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalFeedback = feedback.length;
    const avgRating = totalFeedback > 0 
      ? (feedback.reduce((sum, f) => sum + (f.points || 0), 0) / totalFeedback).toFixed(1)
      : 0;
    
    const categoryBreakdown = {};
    feedback.forEach(f => {
      const cat = f.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });
    
    return {
      totalFeedback,
      avgRating: parseFloat(avgRating),
      categoryBreakdown
    };
  };

  const stats = calculateStats();

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 5) return 'warning';
    return 'danger';
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      teaching: 'primary',
      content: 'info',
      communication: 'warning',
      support: 'success',
      other: 'secondary'
    };
    return colors[category] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading college details...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate('/home')}>
            &larr; Back to Home
          </Button>
        </Col>
      </Row>

      {college && (
        <>
          {/* College Header */}
          <Card className="mb-4 border-0 shadow">
            <Card.Header className="bg-primary text-white py-4">
              <Row className="align-items-center">
                <Col>
                  <h1 className="mb-2">{college.name}</h1>
                  <p className="mb-0">
                    <i className="bi bi-geo-alt"></i> {college.location}
                  </p>
                </Col>
                <Col md="auto" className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Badge bg="info" className="fs-6">
                      {faculty.length} Faculty
                    </Badge>
                    <Badge bg="success" className="fs-6">
                      {students.length} Students
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="lead">{college.description}</p>
              
              {/* Statistics Cards */}
              <Row className="mb-4">
                <Col md={4} className="mb-3">
                  <Card className="border-light h-100">
                    <Card.Body className="text-center">
                      <h6 className="text-muted mb-3">Total Feedback</h6>
                      <h3 className="text-primary mb-0">{stats.totalFeedback}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="border-light h-100">
                    <Card.Body className="text-center">
                      <h6 className="text-muted mb-3">Average Rating</h6>
                      <h3 className={`text-${getRatingColor(stats.avgRating)} mb-0`}>
                        {stats.avgRating}/10
                      </h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4} className="mb-3">
                  <Card className="border-light h-100">
                    <Card.Body className="text-center">
                      <h6 className="text-muted mb-3">Response Rate</h6>
                      <h3 className="text-success mb-0">
                        {students.length > 0 
                          ? Math.round((stats.totalFeedback / students.length) * 100)
                          : 0}%
                      </h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Category Breakdown */}
              {Object.keys(stats.categoryBreakdown).length > 0 && (
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
              )}
            </Card.Body>
          </Card>

          {/* Faculty Section */}
          <Card className="mb-4 border-0 shadow">
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0">Faculty Members ({faculty.length})</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {faculty.length === 0 ? (
                <Alert variant="info">No faculty members found for this college.</Alert>
              ) : (
                <Row>
                  {faculty.map((fac) => {
                    const facultyFeedback = feedback.filter(f => f.faculty === fac.name);
                    const avgRating = facultyFeedback.length > 0
                      ? (facultyFeedback.reduce((sum, f) => sum + (f.points || 0), 0) / facultyFeedback.length).toFixed(1)
                      : 0;
                    
                    return (
                      <Col md={6} lg={4} key={fac.id} className="mb-3">
                        <Card className="h-100 border-light">
                          <Card.Body>
                            <div className="text-center mb-3">
                              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                   style={{ width: '50px', height: '50px' }}>
                                {fac.name?.trim()?.[0]?.toUpperCase() || 'F'}
                              </div>
                              <h6 className="mb-1">{fac.name}</h6>
                              <Badge bg="secondary" className="mb-2">{fac.email}</Badge>
                            </div>
                            
                            <div className="text-center">
                              <div className="mb-2">
                                <small className="text-muted">Average Rating</small>
                                <div className="d-flex align-items-center justify-content-center gap-1">
                                  <h5 className={`mb-0 text-${getRatingColor(avgRating)}`}>
                                    {avgRating || 'N/A'}
                                  </h5>
                                  <small className="text-muted">/10</small>
                                </div>
                              </div>
                              
                              <div className="mb-2">
                                <small className="text-muted">Feedback Count</small>
                                <div>
                                  <Badge bg="info">{facultyFeedback.length}</Badge>
                                </div>
                              </div>
                              
                              {userProfile?.role === 'student' && (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="w-100"
                                  onClick={() => {/* Navigate to feedback form */}}
                                >
                                  Submit Feedback
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Recent Feedback */}
          {feedback.length > 0 && (
            <Card className="mb-4 border-0 shadow">
              <Card.Header className="bg-info text-white">
                <h4 className="mb-0">Recent Feedback ({feedback.length})</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <ListGroup variant="flush">
                  {feedback.slice(0, 10).map((item, index) => (
                    <ListGroup.Item key={item.id} className="py-3 border-light">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex gap-2 align-items-center">
                              <Badge bg={getRatingColor(item.points)} className="fs-6">
                                {item.points}/10
                              </Badge>
                              <Badge bg={getCategoryBadgeColor(item.category)}>
                                {item.category}
                              </Badge>
                              <small className="text-muted">
                                for {item.faculty}
                              </small>
                            </div>
                            <small className="text-muted">
                              {item.timestamp}
                            </small>
                          </div>
                          <p className="mb-0 text-break">{item.text}</p>
                        </div>
                        <Badge bg="secondary" className="mt-1">
                          #{feedback.length - index}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                {feedback.length > 10 && (
                  <div className="text-center mt-3">
                    <Button variant="outline-primary">
                      View All Feedback ({feedback.length})
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
