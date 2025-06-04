// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhuc1LsStEPg-ksXXgnflQ2tu0dl5syHA",
  authDomain: "classicalmath.firebaseapp.com",
  projectId: "classicalmath",
  storageBucket: "classicalmath.firebasestorage.app",
  messagingSenderId: "115442672639",
  appId: "1:115442672639:web:ffd3308688abfcc5d63dca",
  measurementId: "G-05K9M3VQTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// API Functions
export async function pingServer() {
  try {
    const response = await fetch('/api/ping');
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error pinging server:', error);
    throw error;
  }
}

// Get current user
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

// Sign out function
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
} 