import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "tutorial-5dceb.firebaseapp.com",
  projectId: "tutorial-5dceb",
  storageBucket: "tutorial-5dceb.appspot.com",
  messagingSenderId: "291651819954",
  appId: "1:291651819954:web:34f51fdaef9ba0160dacab",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
