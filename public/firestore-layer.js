// Firestore Data Layer Integration
// Replaces localStorage-only approach with Firestore CRUD operations
// Runs before main script.js loads

console.log("⏳ Initializing Firestore data layer...");

// Debounce timer for UI updates (avoid too many re-renders)
let dashboardRefreshTimer = null;
function scheduleUIUpdate() {
  if (dashboardRefreshTimer) clearTimeout(dashboardRefreshTimer);
  dashboardRefreshTimer = setTimeout(() => {
    if (window.refreshLoginBranchOptions) window.refreshLoginBranchOptions();
    // Update ALL pages
    if (window.renderDashboard) window.renderDashboard();
    if (window.renderClients) window.renderClients();
    if (window.renderSchedule) window.renderSchedule();
    if (window.renderInventory) window.renderInventory();
    if (window.renderPackages) window.renderPackages();
    if (window.renderTreatments) window.renderTreatments();
    if (window.renderUpcoming) window.renderUpcoming();
    if (window.renderSales) window.renderSales();
    if (window.updateUpcomingBadge) window.updateUpcomingBadge();
    console.log("🔄 UI updated from Firestore data");
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

// Function to sync current DB to Firestore (for initial setup)
async function syncAllDataToFirestore() {
  if (!window.useFirebase || !window.useFirebase()) {
    console.error("❌ Firebase not available");
    return;
  }
  
  if (!window.DB) {
    console.error("❌ No DB data to sync");
    return;
  }
  
  try {
    const db = firebase.firestore();
    console.log("🔄 Starting bulk sync of seed data to Firestore...");
    
    // Sync each collection
    const collections = [
      { name: 'clients', data: window.DB.clients },
      { name: 'appointments', data: window.DB.appointments },
      { name: 'inventory', data: window.DB.inventory },
      { name: 'packages', data: window.DB.packages },
      { name: 'treatments', data: window.DB.treatments },
      { name: 'expenses', data: window.DB.expenses || [] },
      { name: 'purchases', data: window.DB.purchases || [] },
      { name: 'branches', data: window.DB.branches },
      { name: 'payments', data: window.DB.payments || [] },
      { name: 'sessions', data: window.DB.sessions || [] }
    ];
    
    for (const col of collections) {
      if (Array.isArray(col.data) && col.data.length > 0) {
        for (const item of col.data) {
          const docId = String(item.id);
          const docData = { ...item };
          delete docData.id; // Remove id field to use as document ID
          
          await db.collection(col.name).doc(docId).set(docData, { merge: true });
        }
        console.log(`✅ Synced ${col.data.length} items to ${col.name}`);
      }
    }
    
    console.log("✅ Seed data synced to Firestore!");
  } catch (error) {
    console.error("❌ Error syncing to Firestore:", error.message);
  }
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
  
  // Initial data load - fetch all collections once on startup
  console.log("📥 Loading initial data from Firestore...");
  try {
    // Load all collections in parallel
    const [clientsSnap, apptsSnap, invSnap, pkgSnap, treatSnap, expSnap, purSnap, branchSnap, paySnap, sessSnap] = 
      await Promise.all([
        db.collection('clients').get(),
        db.collection('appointments').get(),
        db.collection('inventory').get(),
        db.collection('packages').get(),
        db.collection('treatments').get(),
        db.collection('expenses').get(),
        db.collection('purchases').get(),
        db.collection('branches').get(),
        db.collection('payments').get(),
        db.collection('sessions').get()
      ]);

    console.log(`📊 Firestore collection sizes: Clients: ${clientsSnap.size}, Appts: ${apptsSnap.size}, Inventory: ${invSnap.size}, Packages: ${pkgSnap.size}, Treatments: ${treatSnap.size}`);

    // Update DB with Firestore data (replace local arrays with Firestore truth)
    if (window.DB) {
      window.DB.clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.appointments = apptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.inventory = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.packages = pkgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.treatments = treatSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.expenses = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.purchases = purSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.branches = branchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.payments = paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      window.DB.sessions = sessSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Check if Firestore has data
      const firestoreHasData = clientsSnap.size + apptsSnap.size + invSnap.size + pkgSnap.size > 0;
      
      if (firestoreHasData) {
        console.log(`✅ Firestore data loaded: ${clientsSnap.size} clients, ${apptsSnap.size} appointments`);
      } else {
        console.warn(`⚠️  Firestore collections are EMPTY - syncing seed data...`);
        // Auto-sync seed data to Firestore
        await syncAllDataToFirestore();
        // Remove local demo cache and reload so app boots from Firebase data
        localStorage.removeItem('awera_clinic_v1');
        location.reload();
        return;
      }
      
      // Save merged data to localStorage
      localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      
      // Trigger initial UI update
      if (window.forceRefreshAllUI) {
        console.log("🔄 Refreshing UI with current data...");
        setTimeout(() => window.forceRefreshAllUI(), 100);
      }
      if (window.refreshLoginBranchOptions) window.refreshLoginBranchOptions();
    }
  } catch (error) {
    console.error("❌ Initial Firestore load failed:", error.message);
  }
  
  // NOW set up real-time listeners for future changes
  console.log("👂 Setting up real-time listeners for future changes...");
  
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
      console.log(`✅ Clients real-time sync: ${clients.length} records`);
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

  // Real-time listener for expenses
  try {
    db.collection('expenses').onSnapshot((snapshot) => {
      const expenses = [];
      snapshot.forEach(doc => {
        expenses.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.expenses = expenses;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Expenses synced: ${expenses.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to expenses:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up expenses listener:", error.message);
  }

  // Real-time listener for purchases
  try {
    db.collection('purchases').onSnapshot((snapshot) => {
      const purchases = [];
      snapshot.forEach(doc => {
        purchases.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.purchases = purchases;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Purchases synced: ${purchases.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to purchases:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up purchases listener:", error.message);
  }

  // Real-time listener for branches
  try {
    db.collection('branches').onSnapshot((snapshot) => {
      const branches = [];
      snapshot.forEach(doc => {
        branches.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.branches = branches;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Branches synced: ${branches.length} records`);
      if (window.refreshLoginBranchOptions) window.refreshLoginBranchOptions();
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to branches:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up branches listener:", error.message);
  }

  // Real-time listener for payments
  try {
    db.collection('payments').onSnapshot((snapshot) => {
      const payments = [];
      snapshot.forEach(doc => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.payments = payments;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Payments synced: ${payments.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to payments:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up payments listener:", error.message);
  }

  // Real-time listener for sessions
  try {
    db.collection('sessions').onSnapshot((snapshot) => {
      const sessions = [];
      snapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      if (window.DB) {
        window.DB.sessions = sessions;
        // Save to localStorage as backup
        localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
      }
      console.log(`✅ Sessions synced: ${sessions.length} records`);
      scheduleUIUpdate(); // Trigger UI update
    }, (error) => {
      console.error("❌ Error listening to sessions:", error);
    });
  } catch (error) {
    console.warn("⚠️  Could not set up sessions listener:", error.message);
  }

  console.log("✅ Firestore real-time listeners initialized");
}

// Start initialization
initFirestoreLayer().catch(err => console.error("Error initializing Firestore layer:", err));

// Make it accessible from console for manual trigger
window.syncAllDataToFirestore = syncAllDataToFirestore;
console.log("💡 To sync current data to Firestore, run: window.syncAllDataToFirestore()");

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
