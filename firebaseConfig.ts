// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
