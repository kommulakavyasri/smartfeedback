import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // If not logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If user profile is not loaded and auth is done, check if it's missing or still loading
  if (!userProfile) {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </Spinner>
        </div>
      );
    }
    // Profile missing from database
    return <Navigate to="/signin" replace />;
  }

  // If user is inactive, redirect to signin
  if (userProfile.isActive === false) {
    return <Navigate to="/signin" replace />;
  }

  // If specific role is required and user doesn't have it, redirect to home
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
