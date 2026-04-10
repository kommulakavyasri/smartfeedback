import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', background: '#f8f9fa' }}>
        <Spinner animation="grow" variant="primary" size="lg" className="mb-4" />
        <h4 className="text-primary fw-light">Securing Connection...</h4>
        <p className="text-muted small">Verifying your credentials</p>
      </div>
    );
  }

  // If not logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If user profile is missing, try to handle it gracefully
  if (!userProfile && user) {
    // If we're authenticated but profile fetch failed, allow entry if we can identify role
    const fallbackRole = localStorage.getItem("role");
    if (!fallbackRole) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center p-5" style={{ height: '100vh' }}>
          <div className="text-center mb-4">
            <span className="display-1">⏳</span>
            <h3 className="mt-3">Still looking for your profile...</h3>
            <p className="text-muted">Database is taking longer than usual to respond.</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
            <Button variant="link" onClick={() => {
              localStorage.setItem("role", "student"); // Default fallback
              window.location.reload();
            }}>
              Continue as Student
            </Button>
          </div>
        </div>
      );
    }
  }

  // If user is inactive, redirect to signin
  if (userProfile && userProfile.isActive === false) {
    return <Navigate to="/signin" replace />;
  }

  // Determine the effective role
  const effectiveRole = userProfile?.role || localStorage.getItem("role");

  // If specific role is required and user doesn't have it, redirect to home
  if (requiredRole && effectiveRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
