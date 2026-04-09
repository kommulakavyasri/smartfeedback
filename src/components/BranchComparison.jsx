import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/FireBaseConfig';
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  ProgressBar, 
  Alert, 
  Table,
  Button,
  Modal,
  Spinner,
  ListGroup
} from 'react-bootstrap';

export default function BranchComparison() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const studentsData = usersData.filter(u => u.role === 'student');
      const facultyData = usersData.filter(u => u.role === 'faculty');
      
      setStudents(studentsData);
      setFaculty(facultyData);

      // Extract unique branches
      const allBranches = [...new Set(usersData.map(u => u.branch).filter(Boolean))];
      setBranches(allBranches);

      // Fetch feedback
      const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
      const feedbackData = feedbackSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp || new Date(doc.data().createdAt?.toDate?.() || doc.data().createdAt).toLocaleString()
      }));
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBranchStats = (branch) => {
    const branchStudents = students.filter(s => s.branch === branch);
    const branchFaculty = faculty.filter(f => f.branch === branch);
    const branchFeedback = feedback.filter(f => {
      const student = students.find(s => s.name === f.studentName);
      return student && student.branch === branch;
    });

    const avgStudentRating = branchFeedback.length > 0
      ? (branchFeedback.reduce((sum, f) => sum + (f.points || 0), 0) / branchFeedback.length).toFixed(1)
      : 0;

    const facultyRatings = branchFaculty.map(fac => {
      const facFeedback = feedback.filter(f => 
        f.faculty && f.faculty.toLowerCase().includes(fac.name.toLowerCase())
      );
      return facFeedback.length > 0
        ? (facFeedback.reduce((sum, f) => sum + (f.points || 0), 0) / facFeedback.length).toFixed(1)
        : 0;
    }).filter(r => r > 0);

    const avgFacultyRating = facultyRatings.length > 0
      ? (facultyRatings.reduce((sum, r) => sum + parseFloat(r), 0) / facultyRatings.length).toFixed(1)
      : 0;

    return {
      branch,
      studentCount: branchStudents.length,
      facultyCount: branchFaculty.length,
      feedbackCount: branchFeedback.length,
      avgStudentRating: parseFloat(avgStudentRating),
      avgFacultyRating: parseFloat(avgFacultyRating),
      students: branchStudents,
      faculty: branchFaculty,
      feedback: branchFeedback
    };
  };

  const branchStats = branches.map(getBranchStats);

  const handleViewDetails = (branchData) => {
    setSelectedBranch(branchData);
    setModalData(branchData);
    setShowModal(true);
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 5) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading branch comparison...</span>
        </Spinner>
        <p className="mt-2">Loading branch comparison data...</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-4">Branch-wise Student & Faculty Comparison</h4>
      
      {branches.length === 0 ? (
        <Alert variant="info" className="text-center">
          No branch data available. Please ensure users have branch information assigned.
        </Alert>
      ) : (
        <>
          {/* Overview Cards */}
          <Row className="mb-4">
            {branchStats.map((stats) => (
              <Col md={6} lg={4} key={stats.branch} className="mb-3">
                <Card className="h-100 border-light">
                  <Card.Body>
                    <div className="text-center mb-3">
                      <h5 className="text-primary mb-2">{stats.branch}</h5>
                      <div className="d-flex justify-content-center gap-2 mb-2">
                        <Badge bg="info">{stats.studentCount} Students</Badge>
                        <Badge bg="success">{stats.facultyCount} Faculty</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Student Avg Rating</small>
                        <Badge bg={getRatingColor(stats.avgStudentRating)}>
                          {stats.avgStudentRating || 'N/A'}/10
                        </Badge>
                      </div>
                      {stats.avgStudentRating > 0 && (
                        <ProgressBar 
                          now={(stats.avgStudentRating / 10) * 100}
                          variant={getRatingColor(stats.avgStudentRating)}
                          style={{ height: '8px' }}
                        />
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Faculty Avg Rating</small>
                        <Badge bg={getRatingColor(stats.avgFacultyRating)}>
                          {stats.avgFacultyRating || 'N/A'}/10
                        </Badge>
                      </div>
                      {stats.avgFacultyRating > 0 && (
                        <ProgressBar 
                          now={(stats.avgFacultyRating / 10) * 100}
                          variant={getRatingColor(stats.avgFacultyRating)}
                          style={{ height: '8px' }}
                        />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleViewDetails(stats)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Comparison Table */}
          <Card className="border-light">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Branch Comparison Table</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Total Feedback</th>
                    <th>Student Avg Rating</th>
                    <th>Faculty Avg Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStats.map((stats) => (
                    <tr key={stats.branch}>
                      <td>
                        <strong>{stats.branch}</strong>
                      </td>
                      <td>
                        <Badge bg="info">{stats.studentCount}</Badge>
                      </td>
                      <td>
                        <Badge bg="success">{stats.facultyCount}</Badge>
                      </td>
                      <td>
                        <Badge bg="secondary">{stats.feedbackCount}</Badge>
                      </td>
                      <td>
                        <Badge bg={getRatingColor(stats.avgStudentRating)}>
                          {stats.avgStudentRating || 'N/A'}/10
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getRatingColor(stats.avgFacultyRating)}>
                          {stats.avgFacultyRating || 'N/A'}/10
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewDetails(stats)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Details Modal */}
          <Modal 
            show={showModal} 
            onHide={() => setShowModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {modalData?.branch} Branch Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalData && (
                <div>
                  <Row className="mb-4">
                    <Col md={3} className="text-center">
                      <h6 className="text-muted">Students</h6>
                      <h3 className="text-info">{modalData.studentCount}</h3>
                    </Col>
                    <Col md={3} className="text-center">
                      <h6 className="text-muted">Faculty</h6>
                      <h3 className="text-success">{modalData.facultyCount}</h3>
                    </Col>
                    <Col md={3} className="text-center">
                      <h6 className="text-muted">Student Rating</h6>
                      <h3 className={`text-${getRatingColor(modalData.avgStudentRating)}`}>
                        {modalData.avgStudentRating || 'N/A'}
                      </h3>
                    </Col>
                    <Col md={3} className="text-center">
                      <h6 className="text-muted">Faculty Rating</h6>
                      <h3 className={`text-${getRatingColor(modalData.avgFacultyRating)}`}>
                        {modalData.avgFacultyRating || 'N/A'}
                      </h3>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <h6 className="mb-3">Students in {modalData.branch}</h6>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {modalData.students.length === 0 ? (
                          <Alert variant="light" className="text-center text-muted">
                            No students found
                          </Alert>
                        ) : (
                          <ListGroup variant="flush">
                            {modalData.students.map(student => (
                              <ListGroup.Item key={student.id} className="py-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>{student.name}</strong>
                                    <br />
                                    <small className="text-muted">{student.email}</small>
                                  </div>
                                  <Badge bg="secondary" className="small">
                                    {student.lastLogin 
                                      ? new Date(student.lastLogin.toDate?.() || student.lastLogin).toLocaleDateString()
                                      : 'Never'
                                    }
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6 className="mb-3">Faculty in {modalData.branch}</h6>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {modalData.faculty.length === 0 ? (
                          <Alert variant="light" className="text-center text-muted">
                            No faculty found
                          </Alert>
                        ) : (
                          <ListGroup variant="flush">
                            {modalData.faculty.map(fac => {
                              const facFeedback = feedback.filter(f => 
                                f.faculty && f.faculty.toLowerCase().includes(fac.name.toLowerCase())
                              );
                              const avgRating = facFeedback.length > 0
                                ? (facFeedback.reduce((sum, f) => sum + (f.points || 0), 0) / facFeedback.length).toFixed(1)
                                : 0;
                              
                              return (
                                <ListGroup.Item key={fac.id} className="py-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <strong>{fac.name}</strong>
                                      <br />
                                      <small className="text-muted">{fac.email}</small>
                                    </div>
                                    <div className="text-end">
                                      <Badge bg={getRatingColor(avgRating)}>
                                        {avgRating || 'N/A'}/10
                                      </Badge>
                                      <br />
                                      <small className="text-muted">{facFeedback.length} feedback</small>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              );
                            })}
                          </ListGroup>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
