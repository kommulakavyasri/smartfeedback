import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Button } from 'react-bootstrap';

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

  // Determine the effective role
  const fallbackRole = localStorage.getItem("role");
  const effectiveRole = userProfile?.role || fallbackRole;

  // If user profile is missing but we have a fallback, trust it temporarily for speed
  if (!userProfile && user && fallbackRole) {
    // If fallback role matches requirements, allow entry
    if (!requiredRole || fallbackRole === requiredRole) {
      return children;
    }
  }

  // If truly stuck with no role info at all
  if (!userProfile && !fallbackRole) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center p-5" style={{ height: '100vh' }}>
        <div className="text-center mb-4">
          <span className="display-1">⌛</span>
          <h3 className="mt-3">Profile Access Required</h3>
          <p className="text-muted">We couldn't determine your account type. Please try again.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
          <Button variant="outline-secondary" onClick={() => {
            localStorage.removeItem("role");
            window.location.href = "/signin";
          }}>
            Back to SignIn
          </Button>
        </div>
      </div>
    );
  }

  // If user is inactive, redirect to signin
  if (userProfile && userProfile.isActive === false) {
    return <Navigate to="/signin" replace />;
  }

  // If specific role is required and user doesn't have it, redirect to home
  if (requiredRole && effectiveRole !== requiredRole) {
    console.warn(`Access denied. ${effectiveRole} tried to access ${requiredRole} route.`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
