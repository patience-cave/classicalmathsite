// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";
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
let app;
let auth;
let functions;

function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    functions = getFunctions(app);
    
    // Connect to emulator in development
    if (window.location.hostname !== 'classicalmath.org') {
      connectFunctionsEmulator(functions, "localhost", 5002);
    }
  }
  return { app, auth, functions };
}

// Initialize Firebase when the module is imported
const { app: firebaseApp, auth: firebaseAuth, functions: firebaseFunctions } = initializeFirebase();

// API Functions
export async function pingServer() {
  try {
    const pingFunction = httpsCallable(firebaseFunctions, 'ping');
    const result = await pingFunction();
    console.log('Full response:', result);
    return result.data;
  } catch (error) {
    console.error('Error pinging server:', error);
    throw error;
  }
}

// Get current user
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, 
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
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get lesson content
export async function lesson(lessonId) {
  try {

    // const pingFunction = httpsCallable(firebaseFunctions, 'ping');
    // const result = await pingFunction();
    // console.log('Full response:', result);
    // return result.data;

    console.log('Getting lesson:', lessonId);
    const lessonFunction = httpsCallable(firebaseFunctions, 'lessons');
    console.log('Lesson function:', lessonFunction);
    const result = await lessonFunction({ lesson_file_name: lessonId });
    console.log('Result:', result);
    return result.data;
  } catch (error) {
    //console.log('Error getting lesson:', error);
    //console.error('Error getting lesson:', error);
    return null;
  }
}