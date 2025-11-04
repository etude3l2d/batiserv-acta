
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUXUpG9UYYYdjL8ubNdKuGHsHinMZu5E0",
  authDomain: "suivi-de-chantier-123523-58c5c.firebaseapp.com",
  projectId: "suivi-de-chantier-123523-58c5c",
  storageBucket: "suivi-de-chantier-123523-58c5c.appspot.com",
  messagingSenderId: "744458197065",
  appId: "1:744458197065:web:be302d34c796de78b50798"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
