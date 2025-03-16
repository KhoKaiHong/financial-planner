import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { initializeAuth } from "firebase/auth"; // Remove getReactNativePersistence
import AsyncStorage from "@react-native-async-storage/async-storage"; // Still needed for your React Native app

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClVQFcOfP1vF6gMok0xJozWXHZ9iZ1bTA",
  authDomain: "financial-planner-2edb6.firebaseapp.com",
  projectId: "financial-planner-2edb6",
  storageBucket: "financial-planner-2edb6.firebasestorage.app",
  messagingSenderId: "948335247766",
  appId: "1:948335247766:web:ec38a02b016a2dcf16ddb7",
  measurementId: "G-9ZKYCWBPSS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only enable Auth persistence in a React Native environment, NOT in Node.js
export const auth = initializeAuth(app); // Removed persistence here

// Initialize Firestore and Export `db`
export const db = getFirestore(app);
