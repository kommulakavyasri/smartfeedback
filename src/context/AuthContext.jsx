// AuthContext for Smart Feedback Analyzer
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/FireBaseConfig";
import { db } from "../firebase/FireBaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            localStorage.setItem("role", userData.role);
          } else {
            setUserProfile(null);
            localStorage.removeItem("role");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          localStorage.removeItem("role");
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem("role");
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Sign up new user
  const signUp = async (email, password, name, role, collegeId) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        collegeId: collegeId,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      setUserProfile(userData);
      localStorage.setItem("role", role);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update last login asynchronously without awaiting to speed up signin
        updateDoc(doc(db, "users", user.uid), {
          lastLogin: new Date()
        }).catch(err => console.error("Error updating last login:", err));
        
        setUserProfile(userData);
        localStorage.setItem("role", userData.role);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: "User profile not found" };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem("role");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  };

  // Get user role
  const getUserRole = () => {
    return userProfile?.role || localStorage.getItem("role") || null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signUp,
      signIn,
      signOut,
      getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);