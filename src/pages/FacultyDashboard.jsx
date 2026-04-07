import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../../components/ProfileModal";
import { Button, Container, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";

export default function FacultyDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const profileInitial = user?.name?.trim()?.[0]?.toUpperCase() || "👤";

  const computeAverages = (feedbackData) => {
    const facultyMap = {};
    feedbackData.forEach(item => {
      const faculty = item.faculty || "Unknown";
      if (!facultyMap[faculty]) {
        facultyMap[faculty] = { total: 0, count: 0 };
      }
      facultyMap[faculty].total += item.points || 0;
      facultyMap[faculty].count += 1;
    });
    const averages = Object.keys(facultyMap).map(faculty => ({
      faculty,
      average: facultyMap[faculty].count > 0 ? (facultyMap[faculty].total / facultyMap[faculty].count).toFixed(1) : 0
    }));
    return averages;
  };

  const averages = computeAverages(data);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDocs(collection(db, "feedback"));
        setData(res.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Profile Button */}
      <Button 
        variant="light" 
        style={{ position: 'absolute', top: '20px', right: '20px', borderRadius: '50%', width: '50px', height: '50px', fontSize: '20px' }}
        onClick={() => setShowProfile(true)}
      >
        {profileInitial}
      </Button>
      
      <Container className="py-5" style={{ width: '100%', maxWidth: '1200px' }}>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-lg border-0" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
              <Card.Header className="bg-success text-white text-center py-4">
                <h2 className="mb-0">Faculty Dashboard</h2>
                <p className="mb-0">View and manage student feedback</p>
              </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <h4>
                  Faculty Average Ratings
                </h4>
                {averages.length > 0 ? (
                  <Row>
                    {averages.map(avg => (
                      <Col md={4} key={avg.faculty} className="mb-3">
                        <Card className="text-center">
                          <Card.Body>
                            <h5>{avg.faculty}</h5>
                            <h3 className="text-primary">{avg.average}/10</h3>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p className="text-muted">No ratings available.</p>
                )}
              </div>

              <div className="mb-4">
                <h4>
                  Student Feedback 
                  <Badge bg="primary" className="ms-2">{data.length}</Badge>
                </h4>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading feedback...</p>
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No feedback submitted yet.</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {data.map((item, i) => {
                    const dateValue = item.createdAt?.toDate?.()?.toLocaleDateString?.() ||
                      (item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : "Unknown date");
                    return (
                      <ListGroup.Item key={item.id} className="py-3">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <strong>{item.faculty || "Faculty"}</strong>
                              <Badge bg="info" pill>{item.points ?? "-"} pts</Badge>
                            </div>
                            <p className="mb-1">{item.text}</p>
                            <small className="text-muted">Submitted on {dateValue}</small>
                          </div>
                          <Badge bg="secondary">#{i + 1}</Badge>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}

              <div className="text-center mt-4">
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
    <ProfileModal
      show={showProfile}
      onHide={() => setShowProfile(false)}
      user={user}
      onProfileSaved={(updatedUser) => setUser(updatedUser)}
    />
    </>
  );
}