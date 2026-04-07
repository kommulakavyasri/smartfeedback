// import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyDlkZe-OI7ozU-h9ggX485DXMVQ5wYxVs4",
//   authDomain: "auth-f77ef.firebaseapp.com",
//   projectId: "auth-f77ef",
//   storageBucket: "auth-f77ef.firebasestorage.app",
//   messagingSenderId: "843368083966",
//   appId: "1:843368083966:web:14868ed623857a8f37d0af"
// };

// const app = initializeApp(firebaseConfig);

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const Analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);