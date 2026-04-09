// Firebase configuration for Smart Feedback Analyzer
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiXOEINlnwGqCcRoqvxB5oKlGOTusmJ_U",
  authDomain: "aurg-bc061.firebaseapp.com",
  projectId: "aurg-bc061",
  storageBucket: "aurg-bc061.firebasestorage.app",
  messagingSenderId: "846644971189",
  appId: "1:846644971189:web:bdf5e0747351bde7d320fc",
  measurementId: "G-R2ZXMTNDRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);