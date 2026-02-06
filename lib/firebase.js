import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDGm6BWsjnXCnYO_3a3G6cN61n1suRR2TA",
  authDomain: "exploding-kit.firebaseapp.com",
  projectId: "exploding-kit",
  storageBucket: "exploding-kit.firebasestorage.app",
  messagingSenderId: "102352008044",
  appId: "1:102352008044:web:9c54c20b4787f949aeb949",
  measurementId: "G-KWRWNH3J6T",
  databaseURL: "https://exploding-kit-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

let analytics = null;
if (typeof window !== "undefined") {
  // Gracefully handle Analytics initialization failures (e.g. ad blockers)
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics failed to initialize (likely blocked by client):", e);
      }
    }
  }).catch(e => {
      console.warn("Firebase Analytics support check failed:", e);
  });
}

export { app, db, analytics };
