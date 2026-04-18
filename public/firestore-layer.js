// Firestore Data Layer Integration
// Replaces localStorage-only approach with Firestore CRUD operations
// Runs before main script.js loads

console.log("⏳ Initializing Firestore data layer...");

// Debounce timer for UI updates (avoid too many re-renders)
let dashboardRefreshTimer = null;
function scheduleUIUpdate() {
  if (dashboardRefreshTimer) clearTimeout(dashboardRefreshTimer);
  dashboardRefreshTimer = setTimeout(() => {
    if (window.renderDashboard) window.renderDashboard();
    if (window.renderClients) window.renderClients();
    if (window.renderSchedule) window.renderSchedule();
    if (window.renderInventory) window.renderInventory();
    if (window.renderPackages) window.renderPackages();
    console.log("🔄 Dashboard updated from Firestore");
  }, 500); // Wait 500ms for multiple changes to batch
}

// Wait for Firebase to be ready
const MAX_WAIT = 10000; // 10 seconds
let firebaseCheckCount = 0;

async function waitForFirebase() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      firebaseCheckCount++;
      if (window.isFirebaseReady && window.isFirebaseReady()) {
        clearInterval(checkInterval);
        console.log("✅ Firebase is ready!");
        resolve(true);
      } else if (firebaseCheckCount * 100 > MAX_WAIT) {
        clearInterval(checkInterval);
        console.warn("⚠️  Firebase took too long, proceeding with localStorage fallback");
        resolve(false);
      }
    }, 100);
  });
}

// Initialize Firestore integration after Firebase is ready
async function initFirestoreLayer() {
  await waitForFirebase();
  
  if (!window.useFirebase || !window.useFirebase()) {
    console.log("📌 Using localStorage (Firebase not available)");
    return;
  }

  console.log("🔄 Setting up Firestore real-time listeners...");

  const db = firebase.firestore();
  
  // Real-time listener for clients
  try {
    db.collection('clients').onSnapshot((snapshot) => {
      const clients = [];
      snapshot.forEach(doc => {
        clients.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.clients = clients;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Clients synced: ${clients.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to clients:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up clients listener:", error.message);
  }

  // Real-time listener for appointments
  try {
    db.collection('appointments').onSnapshot((snapshot) => {
      const appointments = [];
      snapshot.forEach(doc => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.appointments = appointments;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Appointments synced: ${appointments.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to appointments:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up appointments listener:", error.message);
  }

  // Real-time listener for inventory
  try {
    db.collection('inventory').onSnapshot((snapshot) => {
      const inventory = [];
      snapshot.forEach(doc => {
        inventory.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.inventory = inventory;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Inventory synced: ${inventory.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to inventory:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up inventory listener:", error.message);
  }

  // Real-time listener for packages
  try {
    db.collection('packages').onSnapshot((snapshot) => {
      const packages = [];
      snapshot.forEach(doc => {
        packages.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.packages = packages;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Packages synced: ${packages.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to packages:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up packages listener:", error.message);
  }

  // Real-time listener for treatments
  try {
    db.collection('treatments').onSnapshot((snapshot) => {
      const treatments = [];
      snapshot.forEach(doc => {
        treatments.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.treatments = treatments;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Treatments synced: ${treatments.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to treatments:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up treatments listener:", error.message);
  }

  console.log("✅ Firestore real-time listeners initialized");
}

// Start initialization
initFirestoreLayer().catch(err => console.error("Error initializing Firestore layer:", err));

// Export Firestore CRUD helpers
window.FirestoreCRUD = {
  // Add document
  async add(collection, data) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const db = firebase.firestore();
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: new Date(),
        createdBy: firebase.auth().currentUser?.uid || 'system'
      });
      console.log(`✅ Added to ${collection}:`, docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.warn(`⚠️  Firestore add failed (${collection}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Update document
  async update(collection, docId, data) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const db = firebase.firestore();
      await db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'system'
      });
      console.log(`✅ Updated ${collection}/${docId}`);
      return { success: true };
    } catch (error) {
      console.warn(`⚠️  Firestore update failed (${collection}/${docId}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Delete document
  async delete(collection, docId) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const db = firebase.firestore();
      await db.collection(collection).doc(docId).delete();
      console.log(`✅ Deleted ${collection}/${docId}`);
      return { success: true };
    } catch (error) {
      console.warn(`⚠️  Firestore delete failed (${collection}/${docId}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Get all documents
  async getAll(collection) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const db = firebase.firestore();
      const snapshot = await db.collection(collection).get();
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      console.log(`✅ Retrieved ${docs.length} from ${collection}`);
      return { success: true, data: docs };
    } catch (error) {
      console.warn(`⚠️  Firestore getAll failed (${collection}):`, error.message);
      return { success: false, error: error.message };
    }
  }
};

console.log("✅ Firestore data layer initialized");
