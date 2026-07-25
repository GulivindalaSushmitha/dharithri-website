// ============================================
// FIREBASE CONFIGURATION
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7aJEk6jSaNDaLSgvmx6TVDtRpiinjTqs",
    authDomain: "dharithri-training.firebaseapp.com",
    projectId: "dharithri-training",
    storageBucket: "dharithri-training.firebasestorage.app",
    messagingSenderId: "54254956289",
    appId: "1:54254956289:web:753ecd7a1c6b53534a3500",
    measurementId: "G-NHEK585JRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use in other files
export { app, analytics, db, auth };