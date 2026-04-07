import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/home" />} />
        
        <Route path="/home" element={user ? <Home /> : <Navigate to="/signin" />} />
         <Route path="/student" element={user ? <StudentDashboard /> : <Navigate to="/signin" />} />
        <Route path="/faculty" element={user ? <FacultyDashboard /> : <Navigate to="/signin" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;