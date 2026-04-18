// Firebase Initialization & Auth Setup
// This module handles Firebase initialization, authentication, and data layer

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// Firebase Config from SKILLS.MD
const firebaseConfig = {
  apiKey: "AIzaSyB9X91dN4nE6iDGfezVfKtITgT_cWDEuFY",
  authDomain: "awe-ra-clinic-web.firebaseapp.com",
  databaseURL: "https://awe-ra-clinic-web-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "awe-ra-clinic-web",
  storageBucket: "awe-ra-clinic-web.firebasestorage.app",
  messagingSenderId: "726183934132",
  appId: "1:726183934132:web:b204d6589a1e5b14d27fe1",
  measurementId: "G-BXM3BQJC4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in main script
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ User logged in:", user.email);
    window.currentUser = user;
    if (typeof onUserAuthenticated === 'function') {
      onUserAuthenticated(user);
    }
  } else {
    console.log("❌ User logged out");
    window.currentUser = null;
  }
});

// Firebase Auth Functions
window.firebaseLogin = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login successful:", result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("❌ Login failed:", error.message);
    return { success: false, error: error.message };
  }
};

window.firebaseLogout = async () => {
  try {
    await signOut(auth);
    console.log("✅ Logout successful");
    return { success: true };
  } catch (error) {
    console.error("❌ Logout failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Firestore CRUD operations
window.firebaseAddDoc = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      createdBy: window.currentUser?.uid || 'system'
    });
    console.log(`✅ Added to ${collectionName}:`, docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error(`❌ Failed to add to ${collectionName}:`, error.message);
    return { success: false, error: error.message };
  }
};

window.firebaseGetDocs = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({ id: doc.id, ...doc.data() });
    });
    console.log(`✅ Retrieved ${docs.length} documents from ${collectionName}`);
    return { success: true, data: docs };
  } catch (error) {
    console.error(`❌ Failed to get ${collectionName}:`, error.message);
    return { success: false, error: error.message };
  }
};

window.firebaseUpdateDoc = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
      updatedBy: window.currentUser?.uid || 'system'
    });
    console.log(`✅ Updated ${collectionName}/${docId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to update ${collectionName}/${docId}:`, error.message);
    return { success: false, error: error.message };
  }
};

window.firebaseDeleteDoc = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log(`✅ Deleted ${collectionName}/${docId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to delete ${collectionName}/${docId}:`, error.message);
    return { success: false, error: error.message };
  }
};

console.log("✅ Firebase initialized successfully");
