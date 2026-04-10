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
  const [dbStatus, setDbStatus] = useState("checking"); // 'checking', 'connected', 'lagging', 'error'

  // Monitor authentication state
  useEffect(() => {
    let timeoutId;
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      // Always set user immediately to keep auth state snappy
      setUser(currentUser);
      
      if (currentUser) {
        setDbStatus("loading");
        // Fallback role from localStorage if fetch fails
        const fallbackRole = localStorage.getItem("role");
        
        // OPTIMIZATION: If we have a fallback role, let them into the app immediately!
        if (fallbackRole) {
          setUserProfile({ uid: currentUser.uid, email: currentUser.email, role: fallbackRole });
          setLoading(false); // Bypasses the spinner wall
        }

        // Timer to detect 'lagging' status
        timeoutId = setTimeout(() => {
          setDbStatus("lagging");
        }, 3000);

        // Create a promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile fetch timeout")), 10000)
        );

        try {
          // Race the profile fetch
          const userDocPromise = getDoc(doc(db, "users", currentUser.uid));
          const userDoc = await Promise.race([userDocPromise, timeoutPromise]);

          clearTimeout(timeoutId);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            localStorage.setItem("role", userData.role);
            setDbStatus("connected");
          } else {
            setDbStatus("connected");
            if (!fallbackRole) {
               // If no fallback, we must stop loading now
               setUserProfile({ uid: currentUser.uid, email: currentUser.email, role: "student" });
            }
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Profile fetch ended/timed out (background):", error.message);
          setDbStatus("error");
        }
      } else {
        setUserProfile(null);
        setDbStatus("idle");
        localStorage.removeItem("role");
      }
      
      // Ensure loading is ALWAYS false by this point if it wasn't already set
      setLoading(false);
    });

    return () => {
      unsub();
      if (timeoutId) clearTimeout(timeoutId);
    };
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
      
      // Timeout for Firestore read (increased to 10s for reliability)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database read timeout")), 10000)
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
          // If auth succeeded but profile is missing, we might be in a weird state.
          // We'll still allow them in, the dashboard will handle the missing profile.
          const fallbackRole = localStorage.getItem("role") || "student"; 
          return { success: true, user: { uid: user.uid, email: user.email, role: fallbackRole } };
        }
      } catch (dbError) {
        console.error("Firestore getDoc failed/timed out during signin (proceeding anyway):", dbError);
        // CRITICAL: Even if DB times out, we return success because Firebase Auth succeeded!
        // The onAuthStateChanged listener will handle the fallback role.
        const fallbackRole = localStorage.getItem("role") || "student";
        return { success: true, user: { uid: user.uid, email: user.email, role: fallbackRole } };
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