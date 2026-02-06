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

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };
