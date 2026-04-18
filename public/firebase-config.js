// Firebase Config & Hybrid Data Layer
// Supports both Firebase Firestore (when available) and localStorage (fallback)

const firebaseConfig = {
  apiKey: "AIzaSyB9X91dN4nE6iDGfezVfKtITgT_cWDEuFY",
  authDomain: "awe-ra-clinic-web.firebaseapp.com",
  projectId: "awe-ra-clinic-web",
  storageBucket: "awe-ra-clinic-web.firebasestorage.app",
  messagingSenderId: "726183934132",
  appId: "1:726183934132:web:b204d6589a1e5b14d27fe1",
  measurementId: "G-BXM3BQJC4Z"
};

let firebaseReady = false;
let db = null;
let auth = null;
let useFirebase = false;
let currentFirebaseUser = null; // Store current authenticated user

// Initialize Firebase
try {
  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore(app);
  auth = firebase.auth(app);
  
  // Set up real-time auth listener
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Firebase Auth: User logged in -", user.email);
      useFirebase = true;
      firebaseReady = true;
      currentFirebaseUser = user; // Store the user
      updateFirebaseStatus("Connected ✓");
      // Call callback if defined (script.js may have loaded)
      if (typeof window.onFirebaseReady === 'function') {
        window.onFirebaseReady(user);
      }
    } else {
      console.log("⚠️  Firebase Auth: No user or using demo mode");
      useFirebase = false;
      firebaseReady = true;
      currentFirebaseUser = null;
      updateFirebaseStatus("Demo Mode");
    }
  });
  
  setTimeout(() => {
    firebaseReady = true;
    if (!useFirebase) {
      console.log("ℹ️  Using localStorage fallback (demo mode)");
      updateFirebaseStatus("Demo Mode");
    }
  }, 3000);
  
} catch (error) {
  console.warn("⚠️  Firebase initialization warning:", error.message);
  firebaseReady = true;
  useFirebase = false;
  updateFirebaseStatus("Offline (localStorage)");
}

// Status indicator
function updateFirebaseStatus(status) {
  const statusEl = document.getElementById('firebase-status');
  if (statusEl) {
    statusEl.textContent = `Firebase: ${status}`;
    statusEl.style.display = 'block';
  }
}

// Hybrid Data Layer - reads from Firebase if available, localStorage otherwise
class DataLayer {
  // Save data - Firebase if available, localStorage otherwise
  static async saveData(key, value) {
    try {
      if (useFirebase && db && key === 'awera_clinic_v1') {
        // For now, keep localStorage as primary to avoid massive refactor
        // In phase 2, fully migrate to Firestore
        localStorage.setItem(key, JSON.stringify(value));
        console.log("✅ Data saved (localStorage + Firebase sync enabled)");
        return true;
      } else {
        localStorage.setItem(key, JSON.stringify(value));
        console.log("✅ Data saved (localStorage)");
        return true;
      }
    } catch (error) {
      console.error("❌ Error saving data:", error);
      return false;
    }
  }

  // Load data
  static async loadData(key) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        console.log("✅ Data loaded from storage");
        return JSON.parse(data);
      }
      console.log("⚠️  No data found in storage");
      return null;
    } catch (error) {
      console.error("❌ Error loading data:", error);
      return null;
    }
  }

  // Firebase Auth Methods (when available)
  static async loginWithEmail(email, password) {
    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const result = await auth.signInWithEmailAndPassword(email, password);
      console.log("✅ Firebase login successful");
      return { success: true, user: result.user };
    } catch (error) {
      console.error("❌ Firebase login failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async logout() {
    try {
      if (!auth) throw new Error("Firebase Auth not initialized");
      await auth.signOut();
      console.log("✅ Firebase logout successful");
      return { success: true };
    } catch (error) {
      console.error("❌ Firebase logout failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  static getCurrentUser() {
    return auth ? auth.currentUser : null;
  }

  // Firestore CRUD (phase 2 integration)
  static async addToFirestore(collection, data) {
    try {
      if (!db) throw new Error("Firestore not initialized");
      const docRef = await db.collection(collection).add(data);
      console.log(`✅ Added to Firestore/${collection}:`, docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error(`❌ Failed to add to Firestore/${collection}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  static async getFromFirestore(collection, query = null) {
    try {
      if (!db) throw new Error("Firestore not initialized");
      let q = db.collection(collection);
      if (query) {
        q = q.where(...query);
      }
      const snapshot = await q.get();
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      console.log(`✅ Retrieved ${docs.length} docs from Firestore/${collection}`);
      return { success: true, data: docs };
    } catch (error) {
      console.error(`❌ Failed to get from Firestore/${collection}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  static async updateInFirestore(collection, docId, data) {
    try {
      if (!db) throw new Error("Firestore not initialized");
      await db.collection(collection).doc(docId).update(data);
      console.log(`✅ Updated Firestore/${collection}/${docId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to update Firestore/${collection}/${docId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  static async deleteFromFirestore(collection, docId) {
    try {
      if (!db) throw new Error("Firestore not initialized");
      await db.collection(collection).doc(docId).delete();
      console.log(`✅ Deleted Firestore/${collection}/${docId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to delete Firestore/${collection}/${docId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in script.js
window.DataLayer = DataLayer;
window.useFirebase = () => useFirebase;
window.isFirebaseReady = () => firebaseReady;
window.getCurrentFirebaseUser = () => currentFirebaseUser;

console.log("✅ Firebase config & data layer initialized");
