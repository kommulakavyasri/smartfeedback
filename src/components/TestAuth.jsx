// Test component to verify authentication state
import { useAuth } from "../context/AuthContext";
import { Card, Container, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function TestAuth() {
  const { user, userProfile, getUserRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { signOut } = await import("../context/AuthContext");
    // This is just for testing
    if (window.confirm("Clear localStorage and reload?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Container className="py-5">
      <Card>
        <Card.Header className="bg-info text-white">
          <h3>Authentication Test</h3>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Firebase User:</strong> {user ? 'Logged In' : 'Not Logged In'}
          </div>
          
          {user && (
            <>
              <div className="mb-3">
                <strong>User Email:</strong> {user.email}
              </div>
              <div className="mb-3">
                <strong>User UID:</strong> {user.uid}
              </div>
            </>
          )}

          <div className="mb-3">
            <strong>User Profile:</strong> {userProfile ? 'Loaded' : 'Not Loaded'}
          </div>

          {userProfile && (
            <>
              <div className="mb-3">
                <strong>Name:</strong> {userProfile.name}
              </div>
              <div className="mb-3">
                <strong>Role:</strong> <Badge bg={userProfile.role === 'admin' ? 'danger' : userProfile.role === 'faculty' ? 'warning' : 'primary'}>{userProfile.role}</Badge>
              </div>
              <div className="mb-3">
                <strong>College ID:</strong> {userProfile.collegeId}
              </div>
            </>
          )}

          <div className="mb-3">
            <strong>getUserRole():</strong> {getUserRole()}
          </div>

          <div className="mb-3">
            <strong>localStorage role:</strong> {localStorage.getItem('role')}
          </div>

          <hr />

          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => navigate('/home')}>
              Go to Home
            </Button>
            {getUserRole() === 'admin' && (
              <Button variant="danger" onClick={() => navigate('/admin')}>
                Go to Admin
              </Button>
            )}
            <Button variant="warning" onClick={handleLogout}>
              Clear & Reload
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
