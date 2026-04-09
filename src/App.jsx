import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import "./styles/Dashboard.css";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CollegeDetails from "./pages/CollegeDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import TopNavbar from "./components/TopNavbar";
import AddBVCEC from "./components/AddBVCEC";
import CreateAdmin from "./components/CreateAdmin";
import DebugAdmin from "./components/DebugAdmin";
import TestAuth from "./components/TestAuth";
import QuickAddCollege from "./components/QuickAddCollege";
import AddFaculty from "./components/AddFaculty";
import CreateFacultyLogins from "./components/CreateFacultyLogins";

import LandingPage from "./pages/LandingPage";
import PageNotFound from "./pages/PageNotFound";
import Profile from "./pages/Profile";

function App() {
  const { user, userProfile } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        {user && <TopNavbar />}
        <div className="page-content">
          <Routes>
            {/* Public routes */}
            <Route path='*' element={<PageNotFound/>}/>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/home" />} />
            
            {/* Protected routes */}
            <Route 
              path="/home" 
              element={user ? <Home /> : <Navigate to="/signin" />} 
            />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty" 
              element={
                <ProtectedRoute requiredRole="faculty">
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* College details route */}
            <Route 
              path="/college/:id" 
              element={
                <ProtectedRoute>
                  <CollegeDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="/add-bvec" element={<AddBVCEC />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/debug" element={<DebugAdmin />} />
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="/quick-add-college" element={<QuickAddCollege />} />
            <Route path="/add-faculty" element={<AddFaculty />} />
            <Route path="/create-faculty-logins" element={<CreateFacultyLogins />} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;