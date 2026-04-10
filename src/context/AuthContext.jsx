// AuthContext for Smart Feedback Analyzer
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/FireBaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("checking"); 

  // Initialize persistence once
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));
  }, []);

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
        }, 1500); // Reduced from 3000

        try {
          // Race the profile fetch - REDUCED TIMEOUT for better UX
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
          );
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
               setUserProfile({ uid: currentUser.uid, email: currentUser.email, role: "student" });
            }
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.warn("Using fallback profile due to latency/error:", error.message);
          setDbStatus("lagging");
        }
      } else {
        setUserProfile(null);
        setDbStatus("idle");
        localStorage.removeItem("role");
      }
      
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
      // PROACTIVE CACHE: Save role now so onAuthStateChanged can use it immediately
      localStorage.setItem("role", role);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        collegeId: collegeId,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      // Faster DB write timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("DB setup timeout")), 2000)
      );

      try {
        await Promise.race([
          setDoc(doc(db, "users", user.uid), userData),
          timeoutPromise
        ]);
        
        setUserProfile(userData);
        return { success: true, user: userData };
      } catch (dbError) {
        console.error("Async DB profile setup (background):", dbError);
        setUserProfile(userData); 
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
      
      // Faster DB read timeout (3s)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("DB read timeout")), 3000)
      );

      try {
        const userDoc = await Promise.race([
          getDoc(doc(db, "users", user.uid)),
          timeoutPromise
        ]);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          updateDoc(doc(db, "users", user.uid), {
            lastLogin: new Date()
          }).catch(() => {});
          
          setUserProfile(userData);
          localStorage.setItem("role", userData.role);
          
          return { success: true, user: userData };
        } else {
          const fallbackRole = localStorage.getItem("role") || "student"; 
          return { success: true, user: { uid: user.uid, email: user.email, role: fallbackRole } };
        }
      } catch (dbError) {
        console.warn("DB read slow - using cached role for instant entry");
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

  const getUserRole = () => {
    return userProfile?.role || localStorage.getItem("role") || null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      dbStatus, 
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