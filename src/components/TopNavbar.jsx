import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";

export default function TopNavbar() {
  const { user, userProfile, signOut: contextSignOut } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const role = userProfile?.role || localStorage.getItem("role");
  const dashboardPath = role === "faculty" ? "/faculty" : role === "admin" ? "/admin" : "/student";

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