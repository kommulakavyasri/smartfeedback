import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";

export default function TopNavbar() {
  const { user, userProfile, dbStatus, signOut: contextSignOut } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const role = userProfile?.role || localStorage.getItem("role");
  const dashboardPath = role === "faculty" ? "/faculty" : role === "admin" ? "/admin" : "/student";
  
  // Status indicator helper
  const renderStatus = () => {
    if (!user) return null;
    const config = {
      connected: { color: "#28a745", label: "DB Online" },
      loading: { color: "#ffc107", label: "Syncing..." },
      lagging: { color: "#fd7e14", label: "Slow Meta" },
      error: { color: "#dc3545", label: "DB Offline" }
    };
    const s = config[dbStatus] || { color: "#6c757d", label: "Standby" };
    return (
      <div className="d-flex align-items-center me-3 small" title={s.label}>
        <div 
          style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: s.color,
            marginRight: '6px',
            boxShadow: `0 0 5px ${s.color}`
          }} 
        />
        <span className="d-none d-xl-inline text-muted" style={{ fontSize: '0.75rem' }}>{s.label}</span>
      </div>
    );
  };

  const closeMenu = () => setExpanded(false);

  const handleLogout = async () => {
    await contextSignOut();
    closeMenu();
    navigate("/");
  };

  return (
    <Navbar
      expanded={expanded}
      expand="lg"
      bg="light"
      variant="light"
      fixed="top"
      className="shadow-sm px-3"
    >
      <Container>
        {/* Brand */}
        <Navbar.Brand
          as={Link}
          to="/"
          onClick={closeMenu}
          className="fw-bold"
        >
          Smart Feedback
        </Navbar.Brand>

        {/* Toggle Button */}
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => setExpanded(expanded ? false : true)}
        />

        {/* Navbar Content */}
        <Navbar.Collapse id="responsive-navbar-nav">
          
          {/* LEFT SIDE */}
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/home" onClick={closeMenu}>
                 Home
                </Nav.Link>

                <Nav.Link as={Link} to={dashboardPath} onClick={closeMenu}>
                  Dashboard
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* RIGHT SIDE */}
          <Nav className="align-items-lg-center gap-2">
            {!user ? (
              <>
                <Nav.Link as={Link} to="/signin" onClick={closeMenu}>
                  Sign In
                </Nav.Link>

                <Button
                  as={Link}
                  to="/"
                  variant="primary"
                  size="sm"
                  onClick={closeMenu}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {/* Connection Status */}
                {renderStatus()}

                {/* Optional: show user email */}
                <span className="me-2 small text-muted d-none d-lg-block">
                  {user.email}
                </span>

                <Nav.Link as={Link} to="/profile" onClick={closeMenu} className="me-2">
                  Profile
                </Nav.Link>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}