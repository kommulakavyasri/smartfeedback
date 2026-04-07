import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/FireBaseConfig";
import FeedbackForm from "../../components/FeedbackForm";
import ProfileModal from "../../components/ProfileModal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card, Modal, Alert } from "react-bootstrap";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileInitial = user?.name?.trim()?.[0]?.toUpperCase() || "👤";

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow-lg border-0 student-dashboard-card mx-auto" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
              <Card.Header className="bg-primary text-white text-center py-4">
                <h2 className="mb-0">Student Dashboard</h2>
                <p className="mb-0">Share your feedback with faculty</p>
              </Card.Header>
              <Card.Body className="p-4">
                <FeedbackForm />
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
      
      <ProfileModal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        user={user}
        onProfileSaved={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}