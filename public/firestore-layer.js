// Firestore Data Layer Integration
// Replaces localStorage-only approach with Firestore CRUD operations
// Runs before main script.js loads

console.log("⏳ Initializing Firestore data layer...");

// Debounce timer for UI updates (avoid too many re-renders).
// 200ms is enough to batch a burst of rapid snapshots without making the user
// feel latency. 500ms compounded visibly on top of Firestore's own round-trip.
let dashboardRefreshTimer = null;
function scheduleUIUpdate() {
  if (dashboardRefreshTimer) clearTimeout(dashboardRefreshTimer);
  dashboardRefreshTimer = setTimeout(() => {
    // Scrub any duplicate ids / coerce numeric-string ids BEFORE rendering.
    // This is what makes "Edit" on a service open the right record after a
    // concurrent insert from another device. Lives in the patched script.js.
    if (window.normalizeDB) window.normalizeDB();

    // Persist the merged DB to localStorage ONCE per debounce cycle, not
    // per listener. The old code stringified the entire DB (10 collections,
    // potentially hundreds of rows) inside every onSnapshot callback — ten
    // listeners firing within a few seconds meant 10 full-DB stringifies
    // + 10 setItem calls. That's a big chunk of the "10–15 second update
    // time" the user was feeling.
    try {
      if (window.DB) localStorage.setItem('awera_clinic_v1', JSON.stringify(window.DB));
    } catch (e) {
      console.warn("⚠️  localStorage write failed:", e.message);
    }

    // Only re-render the page the user is currently looking at, plus a few
    // always-visible widgets (nav badges, login branch select). The old
    // code re-rendered all 9 pages on every snapshot regardless of which
    // was active — a single client edit triggered 9 render passes, most of
    // them writing into hidden DOM. That was the other big chunk of the
    // update delay.
    const page = (typeof window.currentPage === 'string') ? window.currentPage : null;
    try {
      if (window.refreshLoginBranchOptions) window.refreshLoginBranchOptions();
      if (window.updateUpcomingBadge) window.updateUpcomingBadge();
      if (page === 'dashboard' && window.renderDashboard) window.renderDashboard();
      else if (page === 'clients' && window.renderClients) window.renderClients();
      else if (page === 'schedule' && window.renderSchedule) window.renderSchedule();
      else if (page === 'inventory' && window.renderInventory) window.renderInventory();
      else if (page === 'packages' && window.renderPackages) window.renderPackages();
      else if ((page === 'services' || page === 'treatments') && window.renderTreatments) window.renderTreatments();
      else if (page === 'upcoming' && window.renderUpcoming) window.renderUpcoming();
      else if (page === 'sales' && window.renderSales) window.renderSales();
      else if (!page) {
        // Cold boot / login screen — render dashboard so it's ready the
        // moment the user lands on it after login.
        if (window.renderDashboard) window.renderDashboard();
      }
    } catch (e) {
      console.warn("⚠️  Render error during UI update:", e.message);
    }
    console.log(`🔄 UI updated from Firestore data (page=${page||'pre-login'})`);
  }, 200);
}

// Wait for Firebase AND an authenticated user to be ready.
//
// The old check polled window.isFirebaseReady(), which goes true from a
// 3-second setTimeout in firebase-config.js even before onAuthStateChanged
// has fired. On a slow device (e.g. cold MacBook load, bad wifi) that
// timeout wins the race, initFirestoreLayer then sees useFirebase=false,
// takes the early-return "📌 Using localStorage" branch, and the real-time
// listeners are never attached — which is why the MacBook has been needing
// multiple refreshes before live data shows up.
//
// useFirebase() only goes true AFTER a user is actually signed in, so
// polling it instead guarantees that by the time we resolve, both Firebase
// *and* the auth session exist. MAX_WAIT is generous (5 minutes) because
// the legitimate "not ready yet" case is "user hasn't typed their password
// yet" — we shouldn't fall back to localStorage just because the login
// screen is sitting there.
const MAX_WAIT = 300000; // 5 minutes — effectively "until the user logs in"
let firebaseCheckCount = 0;

async function waitForFirebase() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      firebaseCheckCount++;
      if (window.useFirebase && window.useFirebase()) {
        clearInterval(checkInterval);
        console.log("✅ Firebase + auth ready!");
        resolve(true);
      } else if (firebaseCheckCount * 100 > MAX_WAIT) {
        clearInterval(checkInterval);
        console.warn("⚠️  Firebase/auth took too long, proceeding with localStorage fallback");
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

// Replace Firestore contents with imported data.
// This is intended for restore/import flows where the uploaded file is the source of truth.
async function replaceAllDataInFirestore(sourceDB) {
  if (!window.useFirebase || !window.useFirebase()) {
    console.error("❌ Firebase not available");
    return;
  }

  if (!sourceDB) {
    console.error("❌ No imported DB data to sync");
    return;
  }

  try {
    const db = firebase.firestore();
    console.log("🔄 Replacing Firestore data from imported backup...");

    const collections = [
      { name: 'clients', data: sourceDB.clients || [] },
      { name: 'appointments', data: sourceDB.appointments || [] },
      { name: 'inventory', data: sourceDB.inventory || [] },
      { name: 'packages', data: sourceDB.packages || [] },
      { name: 'treatments', data: sourceDB.treatments || [] },
      { name: 'expenses', data: sourceDB.expenses || [] },
      { name: 'purchases', data: sourceDB.purchases || [] },
      { name: 'branches', data: sourceDB.branches || [] },
      { name: 'payments', data: sourceDB.payments || [] },
      { name: 'sessions', data: sourceDB.sessions || [] }
    ];

    for (const col of collections) {
      const existingSnap = await db.collection(col.name).get();
      for (const doc of existingSnap.docs) {
        await doc.ref.delete();
      }

      for (const item of col.data) {
        if (!item || item.id == null) continue;
        const docId = String(item.id);
        const docData = { ...item };
        delete docData.id;
        await db.collection(col.name).doc(docId).set(docData, { merge: false });
      }

      console.log(`✅ Replaced ${col.data.length} items in ${col.name}`);
    }

    console.log("✅ Imported backup fully restored to Firestore!");
  } catch (error) {
    console.error("❌ Error replacing Firestore data:", error.message);
  }
}

// One-time migration for records written by the old buggy FirestoreCRUD.add().
// The old add() let Firestore auto-generate a random doc id like "abcdef123"
// while the record's own `id` field was a number like 101. Result: every
// subsequent update/delete against id 101 missed the actual doc and silently
// failed. This scanner moves any such doc to its correct path (`collection/101`),
// deduplicating when both the orphan and the correct doc happen to exist.
async function _migrateBadAutoIdDocs(db) {
  const collections = [
    'clients','appointments','inventory','packages','treatments',
    'expenses','purchases','payments','sessions'
  ];
  let totalMoved = 0;
  for (const name of collections) {
    try {
      const snap = await db.collection(name).get();
      for (const doc of snap.docs) {
        const data = doc.data();
        if (data == null || data.id == null) continue;
        const wantedId = String(data.id);
        if (wantedId === doc.id) continue; // already correct
        const targetRef = db.collection(name).doc(wantedId);
        const targetSnap = await targetRef.get();
        if (!targetSnap.exists) {
          // No conflict — move the orphan to its rightful id.
          await targetRef.set(data, { merge: false });
          await doc.ref.delete();
          console.log(`🔧 migrated ${name}/${doc.id} → ${name}/${wantedId}`);
        } else {
          // Both the orphan and the correct doc exist. Pick the newer one by
          // updatedAt / createdAt, keep it at the correct path, delete the other.
          const targetData = targetSnap.data();
          const orphanTs = _tsOf(data);
          const targetTs = _tsOf(targetData);
          if (orphanTs > targetTs) {
            await targetRef.set(data, { merge: false });
          }
          await doc.ref.delete();
          console.log(`🔧 deduped ${name}/${doc.id} (kept ${name}/${wantedId})`);
        }
        totalMoved++;
      }
    } catch (err) {
      console.warn(`⚠️  Migration skipped for ${name}:`, err.message);
    }
  }
  if (totalMoved) console.log(`🔧 _migrateBadAutoIdDocs: fixed ${totalMoved} doc(s)`);
  return totalMoved;
}
function _tsOf(d) {
  // Best-effort: prefer updatedAt, then createdAt, then 0.
  const t = d?.updatedAt?.toMillis?.() ?? d?.updatedAt ?? d?.createdAt?.toMillis?.() ?? d?.createdAt ?? 0;
  return typeof t === 'number' ? t : (t instanceof Date ? t.getTime() : 0);
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

  // Run the one-time migration BEFORE setting up listeners so the first
  // snapshot each listener sees is already clean.
  try {
    await _migrateBadAutoIdDocs(db);
  } catch (err) {
    console.warn("⚠️  Bad-doc-id migration errored (continuing):", err.message);
  }
  
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
        // localStorage write is consolidated into scheduleUIUpdate below.
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
window.replaceAllDataInFirestore = replaceAllDataInFirestore;
console.log("💡 To sync current data to Firestore, run: window.syncAllDataToFirestore()");

// Export Firestore CRUD helpers
window.FirestoreCRUD = {
  // Add document
  //
  // IMPORTANT: if the caller supplies `data.id` we MUST use it as the Firestore
  // document id. The original code called db.collection(c).add(data) which
  // makes Firestore auto-generate a random doc id. That meant a record written
  // locally with id 101 ended up at `clients/abcdef123` on Firestore, and every
  // subsequent `.update('clients', '101', ...)` or `.delete('clients', '101')`
  // routed to `clients/101` — a doc that did not exist — so the write silently
  // failed. Symptoms: "deleted data comes back", "edits don't propagate",
  // "1 minute delay" (user retrying until a write happened to succeed).
  async add(collection, data) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const db = firebase.firestore();
      // If caller provided an id, use it; otherwise let Firestore generate one
      // and echo it back into the stored document's `id` field so every
      // downstream read has a stable identifier.
      const docId = (data && data.id != null && data.id !== '')
        ? String(data.id)
        : db.collection(collection).doc().id;
      const docData = {
        ...data,
        id: (data && data.id != null && data.id !== '') ? data.id : docId,
        createdAt: new Date(),
        createdBy: firebase.auth().currentUser?.uid || 'system'
      };
      await db.collection(collection).doc(docId).set(docData, { merge: false });
      console.log(`✅ Added to ${collection}:`, docId);
      return { success: true, id: docId };
    } catch (error) {
      console.warn(`⚠️  Firestore add failed (${collection}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Update document
  //
  // IMPORTANT history of this call:
  //
  // 1. Round 1 used .add() which made Firestore auto-generate doc ids. Fixed.
  // 2. Round 2 forced String(docId) here because the compat SDK silently
  //    no-ops .doc(<number>). Fixed.
  // 3. Round 3 (this patch): switched from .update() to .set({merge:true}).
  //    Reason: the compat SDK's .update() REQUIRES the doc to already exist
  //    and throws `not-found` if it doesn't. That's exactly the case that
  //    was making "log session resets to 0 on refresh" persist even after
  //    round-2's fixes: some packages in DB.packages came from the old
  //    localStorage seed data and never had a Firestore doc written for
  //    them. saveSession() would mutate p.sessions locally → call
  //    FirestoreCRUD.update('packages', String(p.id), p) → .update() throws
  //    `not-found` → our .catch() logged a warning the user never saw → the
  //    next packages snapshot replaced p with the seed-shaped version that
  //    has no sessions. Sessions counter resets.
  //
  //    .set(data, {merge:true}) is create-or-patch. If the doc doesn't
  //    exist yet, it creates it. If it does, it merges the provided fields.
  //    This is what update() should have been all along for this app's
  //    semantics, because we want "make Firestore reflect this object"
  //    regardless of whether a doc already exists at that path.
  async update(collection, docId, data) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const id = String(docId);
      const db = firebase.firestore();
      await db.collection(collection).doc(id).set({
        ...data,
        id,                  // guarantee the data-field id matches the doc id
        updatedAt: new Date(),
        updatedBy: firebase.auth().currentUser?.uid || 'system'
      }, { merge: true });
      console.log(`✅ Updated ${collection}/${id}`);
      return { success: true };
    } catch (error) {
      console.warn(`⚠️  Firestore update failed (${collection}/${docId}):`, error.message);
      return { success: false, error: error.message };
    }
  },

  // Delete document
  //
  // Same String() coercion story as update() above. This is the specific
  // call path that was making "deleted on phone, comes back on MacBook after
  // refresh": deleteClient / deleteAppt / deleteInv / deletePkg pass a raw
  // numeric id, the old .doc(101).delete() silently no-ops, the local
  // DB.X.filter() removes the row, user sees it disappear — then the
  // snapshot rehydrates it back into the array because Firestore still has
  // it. With String() forced, the delete always reaches the right doc.
  async delete(collection, docId) {
    try {
      if (!window.useFirebase || !window.useFirebase()) {
        throw new Error("Firebase not available");
      }
      const id = String(docId);
      const db = firebase.firestore();
      await db.collection(collection).doc(id).delete();
      console.log(`✅ Deleted ${collection}/${id}`);
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
