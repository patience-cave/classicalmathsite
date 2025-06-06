// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-functions.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
let db;

function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    functions = getFunctions(app);
    db = getFirestore(app);
    
    // Connect to emulator in development
    if (window.location.hostname !== 'classicalmath.org') {
      connectFunctionsEmulator(functions, "localhost", 5002);
    }
  }
  return { app, auth, functions, db };
}

// Initialize Firebase when the module is imported
const { app: firebaseApp, auth: firebaseAuth, functions: firebaseFunctions, db: firebaseDb } = initializeFirebase();

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
      async (user) => {
        unsubscribe();
        if (user) {
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(firebaseDb, "users", user.uid));
          if (!userDoc.exists()) {
            // Create new user document
            const userData = {
              name: user.displayName || "(Blank)",
              email_notifications: true,
              questions: {
                id_0: {
                  answer: 'Water',
                  score: 10
                }
              }
            };
            await setDoc(doc(firebaseDb, "users", user.uid), userData);
          }
        }
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

// API Functions
export async function grade(userInput, correctAnswer) {
  try {
    const gradeFunction = httpsCallable(firebaseFunctions, 'grade');
    const result = await gradeFunction({userInput, correctAnswer});
    console.log('Result:', result);
    return result.data;
  } catch (error) {
    console.error('Error calling GRADE ChatGPT:', error);
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
    return parseLessonContent(result.data);
  } catch (error) {
    //console.log('Error getting lesson:', error);
    //console.error('Error getting lesson:', error);
    return null;
  }
}

function parseLessonContent(text) {
  let html = '';
  const lines = text.split('\n');
  function formatText(line) {
      return line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
  for (let line of lines) {
      line = formatText(line);
      if (line.startsWith('# ')) {
          html += `<h1 class="text-4xl font-bold text-gray-900 mb-4">${line.substring(2)}</h1>`;
      } else if (line.startsWith('### ')) {
          html += `<h3>${line.substring(4)}</h3>`;
      } else if (line.trim().startsWith('! center:')) {
          const centeredText = line.substring(9).trim();
          html += `<div class="centered-text">${centeredText}</div>`;
      } else if (line.trim().startsWith('! image:')) {
          const match = line.match(/! image: (.*) alt: (.*?)(?: size: (\d+)%)*$/);
          if (match) {
              const [_, imagePath, altText, size] = match;
              const sizeStyle = size ? `width: ${size}%;` : 'width: 100%;';
              html += `<img src="/images/${imagePath}" alt="${altText}" style="${sizeStyle}">`;
          }
      } else if (line.trim().startsWith('! quote:')) {
          const quoteMatch = line.match(/! quote: (.*) source: (.*)/);
          if (quoteMatch) {
              const [_, quoteText, source] = quoteMatch;
              window.quoteCounter = (window.quoteCounter || 0) + 1;
              html += `
                  <div class="quote-container">
                      <p class="quote-text">${quoteText}<span class="quote-number" onclick="toggleSource(this)">${window.quoteCounter}</span></p>
                      <div class="quote-source">${source}</div>
                  </div>
              `;
          }
      } else if (line.trim().startsWith('! speak:')) {
          const audioFile = line.match(/! speak: (.*)/)[1];
          html += `
              <div class="audio-player-container">
                  <div class="audio-player">
                      <button class="play-button" onclick="toggleAudio(this)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M10 8l6 4-6 4V8z"/>
                          </svg>
                      </button>
                      <div class="progress-container">
                          <div class="progress-bar"></div>
                      </div>
                      <div class="time-display">0:00 / 0:00</div>
                      <audio src="/speech/${audioFile}" preload="metadata"></audio>
                  </div>
              </div>
          `;
      } else if (line.trim().startsWith('! essay:')) {
          const essayMatch = line.match(/! essay: (.*) answer: (.*)/);
          if (essayMatch) {
              const [_, question, answer] = essayMatch;
              html += `
                  <div class="essay-container">
                      <div class="essay-question">${question}</div>
                      <textarea class="essay-textarea" placeholder="Type your answer here..."></textarea>
                      <div class="loading-spinner"></div>
                      <button class="essay-submit" onclick="submitEssay(this, '${answer}')">Submit</button>
                      <div class="essay-grade"></div>
                  </div>
              `;
          }
      } else if (line.trim().startsWith('! question:')) {
          const questionMatch = line.match(/! question: (.*) a: (.*) b: (.*) c: (.*) d: (.*) e: (.*)/);
          if (questionMatch) {
              const [_, question, correctAnswer, ...otherAnswers] = questionMatch;
              const allAnswers = [correctAnswer, ...otherAnswers];
              const shuffledAnswers = shuffleArray([...allAnswers]);
              html += `
                  <div class="quiz-container">
                      <div class="quiz-question">${question}</div>
                      <div class="quiz-answers">
                          ${shuffledAnswers.map((answer, index) => `
                              <div class="quiz-answer" onclick="checkAnswer(this, '${answer}', '${correctAnswer}')">
                                  <span class="answer-text">${answer}</span>
                                  <div class="answer-feedback">
                                      ${answer === correctAnswer ? 
                                          '<svg class="checkmark" viewBox="0 0 24 24"><path d="M20 6L9 17L4 12"/></svg>Correct' : 
                                          '<svg class="x-mark" viewBox="0 0 24 24"><path d="M6 6L18 18M6 18L18 6"/></svg>Not Quite'}
                                  </div>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              `;
          }
      } else if (line.trim() === '---') {
          html += '<div class="divider"><div class="divider-flat"></div></div>';
      } else if (line.trim() === '~~~') {
          html += '<div class="divider"><div class="divider-wavy"></div></div>';
      } else {
          html += `<p style="margin-bottom: 1.5rem;">${line}</p>`;
      }
  }
  return html;
}

// ✅ SET user data (full or field)
export async function setUserData(userId, dataOrField, value = null) {
  const userRef = doc(firebaseDb, "users", userId);

  try {
    if (typeof dataOrField === "object" && value === null) {
      // Full document set
      await setDoc(userRef, dataOrField);
      console.log("User data written successfully.");
    } else if (typeof dataOrField === "string" && value !== null) {
      // Single field update
      const updateObj = {};
      updateObj[dataOrField] = value;

      await setDoc(userRef, updateObj, { merge: true });
      console.log(`Field '${dataOrField}' updated.`);
    } else {
      console.error("Invalid parameters to setUserData.");
    }
  } catch (error) {
    console.error("Error writing/updating user data: ", error);
  }
}

// ✅ GET user data (full or field)
export async function getUserData(userId, field = null) {
  const userRef = doc(firebaseDb, "users", userId);

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (field) {
        console.log(`Field '${field}':`, data[field]);
        return data[field];
      } else {
        console.log("User data:", data);
        return data;
      }
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return null;
  }
}

export async function doesUserExist(userId) {
  const userDoc = await getDoc(doc(firebaseDb, "users", userId));
  return userDoc.exists();
}
