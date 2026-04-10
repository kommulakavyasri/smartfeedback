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
      // Always set user immediately to keep auth state snappy
      setUser(currentUser);
      
      if (currentUser) {
        // Create a promise that rejects after 5 seconds to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
        );

        try {
          // Race the profile fetch against the timeout
          const userDocPromise = getDoc(doc(db, "users", currentUser.uid));
          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            localStorage.setItem("role", userData.role);
          } else {
            console.warn("User profile not found in Firestore");
            setUserProfile(null);
            localStorage.removeItem("role");
          }
        } catch (error) {
          console.error("Error fetching user profile (handled):", error);
          // If profile fetch fails, we still stop loading so the app isn't stuck
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
      
      // Timeout for Firestore write
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database write timeout")), 5000)
      );

      try {
        await Promise.race([
          setDoc(doc(db, "users", user.uid), userData),
          timeoutPromise
        ]);
        
        setUserProfile(userData);
        localStorage.setItem("role", role);
        return { success: true, user: userData };
      } catch (dbError) {
        console.error("Firestore setDoc failed/timed out:", dbError);
        // We still return success: true because the Auth account was created!
        // The user is logged in, but their profile might be missing.
        // The RoleRedirect or Dashboard will handle the missing profile.
        setUserProfile(userData); // Set local state anyway as a fallback
        return { success: true, user: userData };
      }
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
      
      // Timeout for Firestore read
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database read timeout")), 5000)
      );

      try {
        // Fetch user profile from Firestore
        const userDoc = await Promise.race([
          getDoc(doc(db, "users", user.uid)),
          timeoutPromise
        ]);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Update last login asynchronously
          updateDoc(doc(db, "users", user.uid), {
            lastLogin: new Date()
          }).catch(err => console.error("Error updating last login:", err));
          
          setUserProfile(userData);
          localStorage.setItem("role", userData.role);
          
          return { success: true, user: userData };
        } else {
          return { success: false, error: "User profile not found" };
        }
      } catch (dbError) {
        console.error("Firestore getDoc failed/timed out during signin:", dbError);
        return { success: false, error: "Database connection timed out. Please check your connection or try again." };
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