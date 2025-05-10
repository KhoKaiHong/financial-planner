import admin from "firebase-admin"
// This is the private key generated for the firebase admin sdk
const serviceAccount = require("firebase_admin_sdk_private_key.json");

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
});

export const adminAuth = adminApp.auth();
