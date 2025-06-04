// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js";

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

// Initialize Firebase based on environment
function initializeFirebase() {
  if (window.location.hostname === 'classicalmath.org') {
    const app = initializeApp(firebaseConfig);
    window.firebaseApp = app;
    window.getFunctions = getFunctions;
    window.httpsCallable = httpsCallable;
  } else {
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, "localhost", 5001);
    window.firebaseApp = app;
    window.getFunctions = getFunctions;
    window.httpsCallable = httpsCallable;
  }
}

// API Functions
export async function pingServer() {
  try {
    const functions = getFunctions(window.firebaseApp);
    const pingFunction = httpsCallable(functions, 'ping');
    const result = await pingFunction();
    console.log('Full response:', result);
    return result.data;
  } catch (error) {
    console.error('Ping error:', error);
    throw error;
  }
}

// Initialize Firebase when the module is imported
initializeFirebase(); 