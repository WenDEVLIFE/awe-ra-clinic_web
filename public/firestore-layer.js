/* =========================================================
   AWE-RA CLINIC MANAGEMENT SYSTEM - PROTOTYPE
   Data persists in browser localStorage.
   Designed so data layer can later be swapped for
   Firebase / Supabase without changing UI code.
   ========================================================= */

const STORAGE_KEY = 'awera_clinic_v1';

// -------- Default seed data --------
const defaultData = {
  branches: [
    {id:'gerona', name:'Gerona, Tarlac (Main)', address:'Gerona, Tarlac', phone:''},
    {id:'paniqui', name:'Paniqui, Tarlac', address:'Paniqui, Tarlac', phone:''}
  ],
  users: [
    {username:'admin', password:'demo', role:'admin', name:'Administrator'},
    {username:'reception', password:'demo', role:'reception', name:'Front Desk'},
    {username:'therapist', password:'demo', role:'therapist', name:'Therapist'}
  ],
  clients: [
    {id:1, fname:'Maria', lname:'Santos', phone:'0917-555-0101', email:'maria@example.com', bday:'1992-03-14', gender:'Female', address:'Gerona, Tarlac', homeBranch:'gerona', medical:'Sensitive skin', notes:'Prefers afternoon appointments', created:Date.now()-86400000*60},
    {id:2, fname:'Jessica', lname:'Cruz', phone:'0918-555-0202', email:'jessica@example.com', bday:'1988-07-22', gender:'Female', address:'Paniqui, Tarlac', homeBranch:'paniqui', medical:'', notes:'', created:Date.now()-86400000*30}
  ],
  appointments: [
    {id:1, clientId:1, date: todayStr(), time:'10:00', duration:60, branch:'gerona', service:'Facial Treatment', therapist:'Ana', status:'Confirmed', notes:''},
    {id:2, clientId:2, date: todayStr(), time:'14:00', duration:90, branch:'gerona', service:'Body Massage', therapist:'Rose', status:'Booked', notes:''},
    {id:3, clientId:1, date: addDaysStr(3), time:'11:00', duration:60, branch:'paniqui', service:'Diamond Peel', therapist:'Ana', status:'Booked', notes:''}
  ],
  inventory: [
    // Gerona
    {id:1, branch:'gerona', name:'Glutathione 600mg', category:'Product', unit:'vial', qty:25, reorder:10, cost:350, price:800, supplier:'MedSupply PH', notes:''},
    {id:2, branch:'gerona', name:'Facial Mask Sheet', category:'Supply', unit:'pc', qty:12, reorder:20, cost:15, price:0, supplier:'Beauty Wholesale', notes:'Low stock!'},
    {id:3, branch:'gerona', name:'Diamond Peel Tip', category:'Equipment', unit:'pc', qty:8, reorder:2, cost:1200, price:0, supplier:'', notes:''},
    {id:6, branch:'gerona', name:'Vitamin C 1g', category:'Product', unit:'vial', qty:20, reorder:8, cost:120, price:300, supplier:'MedSupply PH', notes:''},
    {id:7, branch:'gerona', name:'IV Set', category:'Supply', unit:'set', qty:30, reorder:10, cost:60, price:0, supplier:'MedSupply PH', notes:''},
    {id:8, branch:'gerona', name:'Saline 100ml', category:'Supply', unit:'bottle', qty:22, reorder:10, cost:45, price:0, supplier:'MedSupply PH', notes:''},
    // Paniqui
    {id:4, branch:'paniqui', name:'Glutathione 600mg', category:'Product', unit:'vial', qty:15, reorder:10, cost:350, price:800, supplier:'MedSupply PH', notes:''},
    {id:5, branch:'paniqui', name:'Facial Mask Sheet', category:'Supply', unit:'pc', qty:30, reorder:20, cost:15, price:0, supplier:'Beauty Wholesale', notes:''},
    {id:9, branch:'paniqui', name:'Vitamin C 1g', category:'Product', unit:'vial', qty:14, reorder:8, cost:120, price:300, supplier:'MedSupply PH', notes:''},
    {id:10, branch:'paniqui', name:'IV Set', category:'Supply', unit:'set', qty:18, reorder:10, cost:60, price:0, supplier:'MedSupply PH', notes:''},
    {id:11, branch:'paniqui', name:'Saline 100ml', category:'Supply', unit:'bottle', qty:12, reorder:10, cost:45, price:0, supplier:'MedSupply PH', notes:''}
  ],
  treatments: [
    {id:1, name:'Classic Facial', category:'Facial', description:'Deep-cleansing facial with extraction', defaultSessions:6, pricePerSession:1500, daysBetween:14, active:true,
      supplies:[{itemName:'Facial Mask Sheet', qty:1}]},
    {id:2, name:'Diamond Peel', category:'Facial', description:'Microdermabrasion treatment', defaultSessions:6, pricePerSession:2000, daysBetween:14, active:true,
      supplies:[{itemName:'Diamond Peel Tip', qty:1}]},
    {id:3, name:'Glutathione Drip', category:'IV Therapy', description:'Skin-whitening IV push', defaultSessions:10, pricePerSession:2500, daysBetween:7, active:true,
      supplies:[
        {itemName:'Glutathione 600mg', qty:1},
        {itemName:'Vitamin C 1g', qty:1},
        {itemName:'IV Set', qty:1},
        {itemName:'Saline 100ml', qty:1}
      ]},
    {id:4, name:'Body Massage', category:'Wellness', description:'Relaxation / Swedish massage', defaultSessions:5, pricePerSession:1200, daysBetween:7, active:true, supplies:[]},
    {id:5, name:'Laser Hair Removal (Underarm)', category:'Laser', description:'Underarm laser hair removal', defaultSessions:8, pricePerSession:2500, daysBetween:30, active:true, supplies:[]}
  ],
  purchases: [
    {id:1, clientId:1, branch:'gerona', itemName:'Glutathione 600mg', qty:2, unitPrice:800, total:1600, date: addDaysStr(-7), paid:true, notes:'Take-home vials'}
  ],
  packages: [
    {
      id:1, clientId:1, branch:'gerona',
      treatmentId:1,
      packageName:'Classic Facial',
      totalSessions:6, sessionsPaid:3,
      pricePerSession:1500, totalPrice:9000, downpayment:3000,
      daysBetween:14,
      priceLocked:true,
      dateStarted: addDaysStr(-30),
      status:'Active',
      notes:'10% promo applied',
      sessions:[
        {id:1, date: addDaysStr(-28), time:'10:00', therapist:'Ana', notes:'First session, mild redness afterwards', apptId:null},
        {id:2, date: addDaysStr(-14), time:'10:00', therapist:'Ana', notes:'Good progress, skin clearer', apptId:null}
      ],
      payments:[
        {id:1, date: addDaysStr(-30), amount:3000, type:'Downpayment', method:'Cash', ref:'', notes:'Initial DP'},
        {id:2, date: addDaysStr(-14), amount:1500, type:'Session Payment', method:'GCash', ref:'REF-0012', notes:'Paid after 2nd session'}
      ]
    },
    {
      id:2, clientId:2, branch:'gerona',
      treatmentId:3,
      packageName:'Glutathione Drip',
      totalSessions:10, sessionsPaid:2,
      pricePerSession:2500, totalPrice:25000, downpayment:5000,
      daysBetween:7,
      priceLocked:true,
      dateStarted: todayStr(),
      status:'Active',
      notes:'Just availed today — needs first session scheduling',
      sessions:[],
      payments:[
        {id:3, date: todayStr(), amount:5000, type:'Downpayment', method:'GCash', ref:'', notes:'Initial DP'}
      ]
    }
  ],
  expenses: [
    {id:1, branch:'gerona', date: todayStr(), category:'Utilities', amount:850, notes:'Electricity bill share', createdAt: new Date().toISOString()},
    {id:2, branch:'gerona', date: todayStr(), category:'Supplies (non-inventory)', amount:250, notes:'Tissue, alcohol, gloves', createdAt: new Date().toISOString()}
  ],
  counters: {client:100, appt:100, inv:100, pkg:100, session:100, payment:100, treatment:100, purchase:100, expense:100},
  session: {user:null, branch:'gerona'}
};

// -------- Helpers --------
// Local-time date string YYYY-MM-DD. Avoids the UTC off-by-one
// that hits between midnight and 8am Manila time when using toISOString().
function dateToLocalStr(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function todayStr(){ return dateToLocalStr(new Date()); }
function addDaysStr(n){
  const d = new Date();
  d.setDate(d.getDate()+n);
  return dateToLocalStr(d);
}
function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    return JSON.parse(JSON.stringify(defaultData));
  }
  try {
    const d = JSON.parse(raw);
    // Forward-compatibility: ensure new keys exist if loading an older snapshot
    if(!d.packages) d.packages = [];
    if(!d.treatments) d.treatments = JSON.parse(JSON.stringify(defaultData.treatments));
    if(!d.purchases) d.purchases = [];
    if(!d.expenses) d.expenses = [];
    if(!d.counters) d.counters = {};
    ['client','appt','inv','pkg','session','payment','treatment','purchase','expense'].forEach(k=>{ if(!d.counters[k]) d.counters[k]=100; });
    // Each treatment should have a supplies array (inventory items consumed per session)
    d.treatments.forEach(t=>{ if(!Array.isArray(t.supplies)) t.supplies = []; });
    // Backfill: each package should have daysBetween and priceLocked
    d.packages.forEach(p=>{
      if(p.daysBetween==null){
        const t = d.treatments.find(x => String(x.id) === String(p.treatmentId));
        p.daysBetween = t ? t.daysBetween : 14;
      }
      if(p.priceLocked==null){
        p.priceLocked = (p.payments && p.payments.length>0);
      }
      // Always re-derive sessionsPaid from actual payments so any stale
      // stored value is corrected on load. For free packages (no price),
      // sessionsPaid is maxed out — matches business rule.
      const totalPaid = (p.payments||[]).reduce((s,pay)=>s+(+pay.amount||0), 0);
      const pps = +p.pricePerSession || 0;
      const price = +p.totalPrice || 0;
      const total = +p.totalSessions || 0;
      p.sessionsPaid = (price<=0 || pps<=0)
        ? total
        : Math.min(total, Math.max(0, Math.floor(totalPaid/pps)));
    });
    return d;
  } catch(e){ return JSON.parse(JSON.stringify(defaultData)); }
}
function saveData(){
  // Always save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
  
  // Also sync to Firestore if available
  if (window.useFirebase && window.useFirebase()) {
    syncToFirestore();
  }
}

async function syncToFirestore() {
  if (!window.FirestoreCRUD) return;
  // This function is called after major CRUD operations
  // Individual items are synced in their respective save functions
  console.log("🔄 Syncing data to Firestore...");
}

// Force refresh UI when Firestore is ready
function forceRefreshAllUI() {
  console.log("🔄 Force refreshing all UI from Firestore...");
  if (window.renderDashboard) window.renderDashboard();
  if (window.renderClients) window.renderClients();
  if (window.renderSchedule) window.renderSchedule();
  if (window.renderInventory) window.renderInventory();
  if (window.renderPackages) window.renderPackages();
  if (window.renderTreatments) window.renderTreatments();
  if (window.renderUpcoming) window.renderUpcoming();
  if (window.renderSales) window.renderSales();
  if (window.updateUpcomingBadge) window.updateUpcomingBadge();
  console.log("✅ All UI refreshed");
}

function nextId(kind){
  // Bump the counter past any existing id in the matching collection so two
  // devices creating records at the same moment can't produce the same id.
  // Without this, a fresh browser that just hydrated from Firestore will start
  // at DB.counters[kind]=100 and immediately collide with every seeded id.
  const coll = ({
    client:'clients', appt:'appointments', inv:'inventory', pkg:'packages',
    session:null, payment:null, treatment:'treatments',
    purchase:'purchases', expense:'expenses'
  })[kind];
  if(coll && Array.isArray(DB[coll])){
    let max = DB.counters[kind] || 0;
    for(const rec of DB[coll]){
      if(!rec || rec.id==null) continue;
      const n = Number(rec.id);
      if(Number.isFinite(n) && n > max) max = n;
    }
    DB.counters[kind] = max;
  }
  DB.counters[kind] = (DB.counters[kind]||0)+1;
  return DB.counters[kind];
}

// --- Dedup + normalize DB collections ---
// Safe to call any time (e.g. after a Firestore snapshot replaces an array).
// Deduplicates by String(id): if the same logical id was created on two devices
// concurrently, we keep the last-written copy. Also coerces any numeric-string
// id back to a number for stable comparisons elsewhere.
function _dedupById(arr){
  if(!Array.isArray(arr)) return [];
  const byId = new Map();
  const noId = [];
  for(const item of arr){
    if(!item || typeof item !== 'object') continue;
    if(item.id == null){ noId.push(item); continue; }
    const asNum = Number(item.id);
    if(Number.isFinite(asNum) && String(asNum) === String(item.id)){
      item.id = asNum;
    }
    byId.set(String(item.id), item);
  }
  return [...byId.values(), ...noId];
}
function normalizeDB(){
  if(!DB) return;
  ['clients','appointments','inventory','treatments','packages','purchases','expenses'].forEach(k=>{
    if(Array.isArray(DB[k])) DB[k] = _dedupById(DB[k]);
  });
}
// Expose so firestore-layer.js can call this right after it rebuilds DB from
// an onSnapshot event, before any rendering happens.
window.normalizeDB = normalizeDB;

// --- Admin password gate for destructive/sensitive buttons ---
// Used to protect Branch Add/Edit/Delete and Data Management (Export,
// Import, Reset) from accidental clicks. This is a *client-side* guard —
// anyone who opens DevTools can read the password below. It's not a
// security boundary, it's a "don't let a staff member delete Gerona while
// reaching for a different button" guard. For real access control we'd
// need Firestore security rules or a role field on the auth user.
//
// The gate remembers a successful unlock for 10 minutes per tab, so the
// admin isn't re-prompted a dozen times while doing branch setup.
const ADMIN_PASSWORD = '100825Awera';
const ADMIN_UNLOCK_MS = 10 * 60 * 1000; // 10 minutes
let _adminUnlockedUntil = 0;
function requireAdminPassword(reason){
  if(Date.now() < _adminUnlockedUntil) return true;
  const entered = prompt(
    (reason ? reason + '\n\n' : '') +
    'This action is password-protected.\nEnter the admin password to continue:'
  );
  if(entered == null) return false; // cancelled
  if(entered !== ADMIN_PASSWORD){
    alert('Incorrect password.');
    return false;
  }
  _adminUnlockedUntil = Date.now() + ADMIN_UNLOCK_MS;
  return true;
}

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
// Build a JS string literal suitable for embedding inside a DOUBLE-quoted
// HTML attribute like `onclick="fn(${idArg(x)})"`. JSON.stringify wraps the
// value in raw double-quotes, which would terminate the attribute prematurely
// in the browser; escape the outer quotes to &quot; so the attribute parses,
// then the browser decodes &quot; back to " when reading the JS expression.
// This is the reason Delete/Edit/Select-client buttons were silently dying —
// the inline handler HTML was malformed for Firestore-assigned string ids.
function idArg(v){ return JSON.stringify(String(v==null?'':v)).replace(/"/g,'&quot;'); }
function fmtDate(s){ if(!s) return ''; const d=new Date(s+'T00:00'); return d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
function fmtTime(t){ if(!t) return ''; const [h,m]=t.split(':'); const hh=((+h+11)%12)+1; const ap=+h>=12?'PM':'AM'; return `${hh}:${m} ${ap}`; }
function slugifyBranch(val){
  return String(val==null ? '' : val)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}
function normalizeBranchId(val){
  const key = slugifyBranch(val);
  if(!key) return '';
  const match = (DB.branches||[]).find(b=>{
    const id = slugifyBranch(b.id);
    const name = slugifyBranch(b.name);
    return key===id || key===name || key.includes(id) || id.includes(key) || key.includes(name) || name.includes(key);
  });
  return match ? match.id : key;
}
function branchMatches(value, branchId){
  return normalizeBranchId(value) === normalizeBranchId(branchId);
}
function branchName(id){
  const key = normalizeBranchId(id);
  const b = DB.branches.find(x=>normalizeBranchId(x.id)===key || slugifyBranch(x.name)===key);
  return b ? b.name : id;
}
function normalizeLabel(val){
  return String(val == null ? '' : val).trim().toLowerCase().replace(/\s+/g, ' ');
}
function clientFullName(rec){
  return normalizeLabel(`${rec?.fname || ''} ${rec?.lname || ''}`);
}
function findDuplicateClient(fname, lname, branch, excludeId){
  const name = normalizeLabel(`${fname} ${lname}`);
  const branchKey = normalizeBranchId(branch);
  return (DB.clients || []).find(c => String(c.id) !== String(excludeId) && clientFullName(c) === name && normalizeBranchId(c.homeBranch) === branchKey) || null;
}
function findDuplicateBranch(name, excludeId){
  const key = slugifyBranch(name);
  return (DB.branches || []).find(b => String(b.id) !== String(excludeId) && slugifyBranch(b.name) === key) || null;
}
function findDuplicateAppointment(clientId, date, branch, excludeId){
  const clientKey = String(clientId);
  const branchKey = normalizeBranchId(branch);
  return (DB.appointments || []).find(a => String(a.id) !== String(excludeId) && String(a.clientId) === clientKey && a.date === date && normalizeBranchId(a.branch) === branchKey) || null;
}
function findDuplicateInventoryItem(name, branch, excludeId){
  const itemKey = normalizeLabel(name);
  const branchKey = normalizeBranchId(branch);
  return (DB.inventory || []).find(i => String(i.id) !== String(excludeId) && normalizeLabel(i.name) === itemKey && normalizeBranchId(i.branch) === branchKey) || null;
}
function findDuplicatePackage(clientId, treatmentId, branch, excludeId){
  const clientKey = String(clientId);
  const treatmentKey = String(treatmentId);
  const branchKey = normalizeBranchId(branch);
  return (DB.packages || []).find(p => String(p.id) !== String(excludeId) && String(p.clientId) === clientKey && String(p.treatmentId) === treatmentKey && normalizeBranchId(p.branch) === branchKey) || null;
}
function findClientById(clientId){
  const key = String(clientId);
  return (DB.clients || []).find(c => String(c.id) === key) || null;
}
function findAppointmentById(apptId){
  const key = String(apptId);
  return (DB.appointments || []).find(a => String(a.id) === key) || null;
}

let DB = loadData();
window.DB = DB;
let currentPage = 'dashboard';
let calDate = new Date();

const SessionManager = {
  async setFirebaseUser(user, branchId){
    if(!user) return;
    const branch = normalizeBranchId(branchId || DB.session?.branch || 'gerona');
    DB.session = {
      user: {
        email: user.email,
        uid: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        role: 'user'
      },
      branch
    };
    window.DB = DB;
    saveData();
    const overlay = document.getElementById('login-overlay');
    if(overlay) overlay.style.display = 'none';
    const branchSelector = document.getElementById('branch-selector');
    if(branchSelector) branchSelector.value = branch;
    const userPill = document.getElementById('user-pill');
    if(userPill) userPill.textContent = DB.session.user.name + ' (' + DB.session.user.role + ')';
    refreshAll();
    setTimeout(() => forceRefreshAllUI(), 250);
  },
  async clear(){
    DB.session = { user:null, branch: normalizeBranchId(DB.session?.branch || 'gerona') || 'gerona' };
    window.DB = DB;
    saveData();
    const overlay = document.getElementById('login-overlay');
    if(overlay) overlay.style.display = 'flex';
  }
};
window.SessionManager = SessionManager;

// -------- Auth --------
async function doLogin(){
  const email = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const branch = normalizeBranchId(document.getElementById('login-branch').value);
  
  if(!email || !password){ alert('Email and password are required'); return; }
  
  try {
    // Try Firebase Auth first
    if(window.DataLayer) {
      const result = await window.DataLayer.loginWithEmail(email, password);
      if(result.success) {
        console.log("✅ Login successful via Firebase:", result.user.email);
        await SessionManager.setFirebaseUser(result.user, branch);
        return;
      } else {
        alert('Login failed: ' + (result.error || 'Invalid credentials'));
        return;
      }
    }
  } catch(error) {
    console.error("Login error:", error);
    alert('Login error: ' + error.message);
  }
}

async function doLogout(){
  try {
    // Logout from Firebase
    if(window.DataLayer) {
      const result = await window.DataLayer.logout();
      if(result.success) {
        console.log("✅ Logout successful");
      }
    }
    await SessionManager.clear();
    location.reload();
  } catch(error) {
    console.error("Logout error:", error);
    location.reload();
  }
}
function switchBranch(b){
  DB.session.branch = normalizeBranchId(b);
  saveData();
  refreshAll();
}

// -------- Page routing --------
function showPage(id, btn){
  currentPage = id;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  refreshAll();
}

// -------- Dashboard --------
function renderDashboard(){
  const br = DB.session.branch;
  document.getElementById('dash-branch-name').textContent = branchName(br);
  const branchClients = DB.clients.filter(c=>(c.homeBranch||'')===br);
  document.getElementById('stat-clients').textContent = branchClients.length;
  const today = todayStr();
  const in7 = addDaysStr(7);
  const todayAppts = DB.appointments.filter(a=>branchMatches(a.branch, br) && a.date===today);
  const upcoming = DB.appointments.filter(a=>branchMatches(a.branch, br) && a.date>=today && a.date<=in7);
  document.getElementById('stat-today').textContent = todayAppts.length;
  document.getElementById('stat-upcoming').textContent = upcoming.length;
  const lowStock = DB.inventory.filter(i=>branchMatches(i.branch, br) && i.qty <= i.reorder);
  document.getElementById('stat-lowstock').textContent = lowStock.length;
  const activePkgs = DB.packages.filter(p=>branchMatches(p.branch, br) && p.status==='Active');
  document.getElementById('stat-packages').textContent = activePkgs.length;
  
  // Debug logging
  console.log(`Dashboard render: ${branchClients.length} clients at ${br} from ${window.useFirebase?.() ? 'Firestore' : 'localStorage'}`);
  
  const totalBalance = activePkgs.reduce((sum,p)=>sum+pkgStats(p).balance, 0);
  document.getElementById('stat-balance').textContent = money(totalBalance);

  // Alerts — round 6: vertical list, one item per line, with reorder threshold.
  let alertHtml = '';
  if(lowStock.length){
    const rows = lowStock
      .slice()
      .sort((a,b)=> (+a.qty||0) - (+b.qty||0)) // most-urgent first
      .map(i=>{
        const status = i.qty===0
          ? '<span class="pill bad" style="margin-left:6px">Out</span>'
          : '<span class="pill warn" style="margin-left:6px">Low</span>';
        return `<div class="lowstock-row" style="padding:4px 0;border-top:1px solid rgba(212,175,55,0.18);display:flex;justify-content:space-between;align-items:center;gap:8px">`
             + `<span><b>${esc(i.name)}</b> — ${i.qty} ${esc(i.unit||'')} on hand <small style="opacity:0.75">(reorder at ${i.reorder})</small>${status}</span>`
             + `</div>`;
      }).join('');
    alertHtml = `<div class="alert warn" style="padding:10px 14px">`
              + `<div style="font-weight:700;margin-bottom:6px">⚠ Low stock alert (${lowStock.length})</div>`
              + rows
              + `</div>`;
  }
  document.getElementById('low-stock-alert').innerHTML = alertHtml;

  // Today schedule
  const sched = document.getElementById('today-schedule');
  if(!todayAppts.length){
    sched.innerHTML = '<div class="empty">No appointments scheduled today.</div>';
  } else {
    const rows = todayAppts.sort((a,b)=>a.time.localeCompare(b.time)).map(a=>{
      const c = DB.clients.find(x=>x.id===a.clientId);
      const name = c ? c.fname+' '+c.lname : '—';
      return `<tr>
        <td>${fmtTime(a.time)}</td>
        <td><b>${esc(name)}</b></td>
        <td>${esc(a.service||'')}</td>
        <td>${esc(a.therapist||'')}</td>
        <td><span class="pill ${a.status==='Confirmed'?'ok':a.status==='Cancelled'||a.status==='No-show'?'bad':'info'}">${esc(a.status)}</span></td>
      </tr>`;
    }).join('');
    sched.innerHTML = `<table><thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Therapist</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// -------- Clients --------
// Client-table sort state. null = default (alphabetical by last-name+first-name).
// Otherwise one of 'phone' | 'address' | 'branch'. Clicking the same column
// header twice returns to default (null). Click a different column to switch.
let clientSort = null;
function sortClients(col){
  clientSort = (clientSort === col) ? null : col;
  renderClients();
}
window.sortClients = sortClients;

function renderClients(){
  // Per round-4 item #3: client records are shared across all branches.
  // The Client list on any branch shows every client. Dashboard's "Total
  // Clients" still filters by homeBranch === current branch (unchanged).
  const q = (document.getElementById('client-search')?.value||'').toLowerCase();
  const filtered = DB.clients.filter(c=>{
    if(!q) return true;
    // Address is also searchable (email dropped from display; still searched
    // in case some old clients were only findable by it).
    return (c.fname+' '+c.lname+' '+(c.phone||'')+' '+(c.address||'')+' '+(c.email||'')).toLowerCase().includes(q);
  });

  // ---- Apply sort ----
  const defaultCmp = (a,b) => (a.lname||'').localeCompare(b.lname||'') || (a.fname||'').localeCompare(b.fname||'');
  if(clientSort === 'phone'){
    // "no-phone first, then phone clients alphabetical"
    filtered.sort((a,b)=>{
      const aHas = !!(a.phone && a.phone.trim());
      const bHas = !!(b.phone && b.phone.trim());
      if(aHas !== bHas) return aHas ? 1 : -1;   // no-phone (false) comes first
      return defaultCmp(a,b);
    });
  } else if(clientSort === 'address'){
    filtered.sort((a,b)=> (a.address||'').localeCompare(b.address||'') || defaultCmp(a,b));
  } else if(clientSort === 'branch'){
    filtered.sort((a,b)=> (branchName(a.homeBranch)||'').localeCompare(branchName(b.homeBranch)||'') || defaultCmp(a,b));
  } else {
    filtered.sort(defaultCmp);
  }

  const tbl = document.getElementById('clients-table');
  if(!filtered.length){ tbl.innerHTML = '<div class="empty">No clients found. Click "+ New Client" to add one.</div>'; return; }

  // Visual indicator on active sort column
  const arrow = k => clientSort===k ? ' <span style="color:var(--blue)">▼</span>' : '';
  const plain = '<span style="color:var(--muted);font-size:10px">↕</span>';

  const rows = filtered.map(c=>`<tr>
    <td><b>${esc(c.lname)}, ${esc(c.fname)}</b></td>
    <td>${esc(c.phone||'—')}</td>
    <td>${esc(branchName(c.homeBranch))}</td>
    <td>${esc(c.address||'—')}</td>
    <td>
      <button class="btn small secondary" onclick="viewClient(${c.id})">View</button>
      <button class="btn small secondary" onclick="openClientModal(${c.id})">Edit</button>
      <button class="btn small danger" onclick="deleteClient(${c.id})">Delete</button>
    </td></tr>`).join('');
  tbl.innerHTML = `<table>
    <thead><tr>
      <th>Name</th>
      <th style="cursor:pointer;user-select:none" onclick="sortClients('phone')" title="Click to sort: missing-phone first. Click again for default.">Phone ${clientSort==='phone' ? arrow('phone') : plain}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortClients('branch')" title="Click to sort by home branch. Click again for default.">Home Branch ${clientSort==='branch' ? arrow('branch') : plain}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortClients('address')" title="Click to sort alphabetically by address. Click again for default.">Address ${clientSort==='address' ? arrow('address') : plain}</th>
      <th>Actions</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// Populate the two <datalist> dropdowns with names already entered
// elsewhere in the system (so reception doesn't have to retype them).
function fillStaffDatalists(){
  const br = DB.session.branch;
  const spec = new Set(), fac = new Set();
  (DB.clients||[]).forEach(c=>{
    if((c.homeBranch||'')!==br) return;
    if(c.skinSpecialist) spec.add(c.skinSpecialist.trim());
    if(c.facialist) fac.add(c.facialist.trim());
  });
  const specEl = document.getElementById('specialist-options');
  const facEl  = document.getElementById('facialist-options');
  if(specEl) specEl.innerHTML = Array.from(spec).sort().map(n=>`<option value="${esc(n)}">`).join('');
  if(facEl)  facEl.innerHTML  = Array.from(fac).sort().map(n=>`<option value="${esc(n)}">`).join('');
}
function openClientModal(id){
  fillBranchSelect('c-branch');
  fillStaffDatalists();
  if(id){
    const c = DB.clients.find(x=>x.id===id);
    if(!c){ alert('Client not found.'); return; }
    // Clients are shared across branches (round 4); editing is allowed on
    // any client from any branch. The Home Branch select in the form lets
    // you correct a client's primary branch if needed.
    document.getElementById('client-modal-title').textContent = 'Edit Client';
    document.getElementById('client-id').value = c.id;
    document.getElementById('c-fname').value = c.fname||'';
    document.getElementById('c-lname').value = c.lname||'';
    document.getElementById('c-phone').value = c.phone||'';
    document.getElementById('c-email').value = c.email||'';
    document.getElementById('c-bday').value = c.bday||'';
    document.getElementById('c-gender').value = c.gender||'Female';
    document.getElementById('c-address').value = c.address||'';
    document.getElementById('c-branch').value = c.homeBranch||'gerona';
    document.getElementById('c-specialist').value = c.skinSpecialist||'';
    document.getElementById('c-facialist').value = c.facialist||'';
    document.getElementById('c-medical').value = c.medical||'';
    document.getElementById('c-notes').value = c.notes||'';
  } else {
    document.getElementById('client-modal-title').textContent = 'New Client';
    ['client-id','c-fname','c-lname','c-phone','c-email','c-bday','c-address','c-specialist','c-facialist','c-medical','c-notes'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('c-branch').value = DB.session.branch;
  }
  openModal('client-modal');
}
function saveClient(){
  const id = document.getElementById('client-id').value;
  const fname = document.getElementById('c-fname').value.trim();
  const lname = document.getElementById('c-lname').value.trim();
  if(!fname || !lname){ alert('First and last name are required'); return; }
  const branch = document.getElementById('c-branch').value;
  const dupClient = findDuplicateClient(fname, lname, branch, id);
  if(dupClient){
    alert('A client with the same name already exists in this branch.');
    return;
  }
  const rec = {
    fname, lname,
    phone: document.getElementById('c-phone').value.trim(),
    email: document.getElementById('c-email').value.trim(),
    bday: document.getElementById('c-bday').value,
    gender: document.getElementById('c-gender').value,
    address: document.getElementById('c-address').value.trim(),
    homeBranch: branch,
    skinSpecialist: document.getElementById('c-specialist').value.trim(),
    facialist: document.getElementById('c-facialist').value.trim(),
    medical: document.getElementById('c-medical').value,
    notes: document.getElementById('c-notes').value
  };
  if(id){
    const idx = DB.clients.findIndex(x=>x.id==id);
    DB.clients[idx] = {...DB.clients[idx], ...rec};
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('clients', id, rec).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    rec.id = nextId('client');
    rec.created = Date.now();
    DB.clients.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('clients', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('client-modal');
  renderClients();
}
function deleteClient(id){
  const c = DB.clients.find(x=>x.id===id);
  if(!c){ alert('Client not found.'); return; }
  // Clients are shared across branches (round 4). We show the client's home
  // branch in the confirmation so the user doesn't accidentally delete
  // someone registered to the other location.
  const branchTag = branchMatches(c.homeBranch, DB.session.branch)
    ? '' : ` (home branch: ${branchName(c.homeBranch)})`;
  if(!confirm(`Delete ${c.fname} ${c.lname}${branchTag}? Their appointments will remain but show "Unknown client".`)) return;
  DB.clients = DB.clients.filter(x=>x.id!==id);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('clients', id).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  renderClients();
}
// Rolls up everything the client owes / has paid.
// Includes packages (payments vs. totalPrice) + product purchases (paid vs. unpaid).
function clientBalance(clientId){
  const br = DB.session.branch;
  const pkgs = DB.packages.filter(p=>p.clientId===clientId && branchMatches(p.branch, br));
  const purs = (DB.purchases||[]).filter(p=>p.clientId===clientId && branchMatches(p.branch, br));
  let pkgPaid = 0, pkgBalance = 0, purPaid = 0, purUnpaid = 0;
  pkgs.forEach(p=>{
    const s = pkgStats(p);
    pkgPaid += s.totalPaid;
    pkgBalance += s.balance;
  });
  purs.forEach(p=>{
    if(p.paid) purPaid += +p.total||0;
    else purUnpaid += +p.total||0;
  });
  return {
    totalPaid: pkgPaid + purPaid,
    totalBalance: pkgBalance + purUnpaid,
    pkgPaid, pkgBalance, purPaid, purUnpaid,
    packages: pkgs, purchases: purs
  };
}

function viewClient(id){
  currentClientViewId = id;
  const c = DB.clients.find(x=>x.id===id);
  if(!c){ alert('Client not found.'); return; }
  // Client records are shared across branches (round 4). Appointment
  // history is shown for ALL branches so receptionists at either location
  // can see the client's full history at a glance.
  const history = DB.appointments.filter(a=>a.clientId===id).sort((a,b)=>b.date.localeCompare(a.date));
  const histRows = history.length ? history.map(a=>`<tr><td>${fmtDate(a.date)} ${fmtTime(a.time)}</td><td>${esc(a.service||'')}</td><td>${esc(branchName(a.branch))}</td><td>${esc(a.status)}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--muted)">No appointment history</td></tr>';

  const bal = clientBalance(id);

  // Packages
  const pkgs = bal.packages;
  const pkgRows = pkgs.length ? pkgs.map(p=>{
    const s = pkgStats(p);
    return `<tr>
      <td><b>${esc(p.packageName)}</b><div style="font-size:11px;color:var(--muted)">${esc(branchName(p.branch))}</div></td>
      <td>${s.sessionsUsed} / ${p.totalSessions}</td>
      <td>${s.sessionsPaid} / ${p.totalSessions}</td>
      <td class="money">${money(s.totalPaid)}</td>
      <td class="money" style="color:${s.balance>0?'var(--danger)':'var(--success)'}">${money(s.balance)}</td>
      <td><span class="pill ${p.status==='Active'?'info':p.status==='Completed'?'ok':'bad'}">${esc(p.status)}</span></td>
      <td><button class="btn small secondary" onclick="closeModal('client-view-modal');viewPkg(${p.id})">Open</button></td>
    </tr>`;
  }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--muted)">No packages availed</td></tr>';

  // Purchases
  const purs = bal.purchases.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const purRows = purs.length ? purs.map(p=>`
    <tr>
      <td>${fmtDate(p.date)}</td>
      <td><b>${esc(p.itemName)}</b><div style="font-size:11px;color:var(--muted)">${esc(branchName(p.branch))}</div></td>
      <td>${p.qty}</td>
      <td class="money">${money(p.unitPrice)}</td>
      <td class="money">${money(p.total)}</td>
      <td>
        <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-size:12px">
          <input type="checkbox" ${p.paid?'checked':''} onchange="togglePurchasePaid(${p.id})" style="width:16px;height:16px"/>
          ${p.paid?'<span class="pill ok">Paid</span>':'<span class="pill bad">Unpaid</span>'}
        </label>
      </td>
      <td><button class="btn small danger" onclick="removePurchase(${p.id})" title="Remove">✕</button></td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--muted)">No product purchases yet</td></tr>';

  document.getElementById('client-view-body').innerHTML = `
    <h3 style="margin-top:0">${esc(c.fname+' '+c.lname)}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:14px">
      <div><b>Phone:</b> ${esc(c.phone||'—')}</div>
      <div><b>Birthdate:</b> ${esc(c.bday||'—')}</div>
      <div><b>Gender:</b> ${esc(c.gender||'—')}</div>
      <div><b>Home Branch:</b> ${esc(branchName(c.homeBranch))}</div>
      <div style="grid-column:span 2"><b>Address:</b> ${esc(c.address||'—')}</div>
      <div><b>Skin Specialist:</b> ${esc(c.skinSpecialist||'—')}</div>
      <div><b>Facialist:</b> ${esc(c.facialist||'—')}</div>
    </div>

    <!-- Balance summary -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:16px">
      <div class="stat" style="border-left-color:var(--success);padding:12px">
        <div class="label">Total Amount Paid</div>
        <div class="value" style="font-size:22px;color:var(--success)">${money(bal.totalPaid)}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Packages ${money(bal.pkgPaid)} + Products ${money(bal.purPaid)}</div>
      </div>
      <div class="stat" style="border-left-color:${bal.totalBalance>0?'var(--danger)':'var(--success)'};padding:12px">
        <div class="label">Outstanding Balance</div>
        <div class="value" style="font-size:22px;color:${bal.totalBalance>0?'var(--danger)':'var(--success)'}">${money(bal.totalBalance)}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Packages ${money(bal.pkgBalance)} + Unpaid products ${money(bal.purUnpaid)}</div>
      </div>
    </div>

    ${c.medical?`<div style="background:#fbe8d6;padding:10px;border-radius:6px;margin-bottom:10px;border-left:3px solid var(--warn)"><b>Medical Notes:</b> ${esc(c.medical)}</div>`:''}
    ${c.notes?`<div style="background:var(--blue-ghost);border:1px solid var(--border-blue);border-left:3px solid var(--blue-light);padding:10px;border-radius:6px;margin-bottom:14px"><b>Notes:</b> ${esc(c.notes)}</div>`:''}

    <h4 style="display:flex;justify-content:space-between;align-items:center">Packages Availed</h4>
    <table style="margin-bottom:18px"><thead><tr><th>Package</th><th>Used</th><th>Paid</th><th>Total Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>${pkgRows}</tbody></table>

    <h4 style="display:flex;justify-content:space-between;align-items:center">
      Product Purchases
      <button class="btn small" onclick="openPurchaseModal(${id})">+ Add Purchase</button>
    </h4>
    <table style="margin-bottom:18px"><thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${purRows}</tbody></table>

    <h4>Appointment History</h4>
    <table><thead><tr><th>When</th><th>Service</th><th>Branch</th><th>Status</th></tr></thead><tbody>${histRows}</tbody></table>`;
  openModal('client-view-modal');
}
let currentClientViewId = null;

// -------- Client product purchases --------
function openPurchaseModal(clientId, purchaseId){
  document.getElementById('pur-client-id').value = clientId;
  document.getElementById('pur-id').value = purchaseId||'';
  document.getElementById('purchase-modal-title').textContent = purchaseId ? 'Edit Purchase' : 'Add Product Purchase';
  // Populate item dropdown with current branch's inventory
  const br = DB.session.branch;
  const items = DB.inventory.filter(i=>branchMatches(i.branch, br)).slice().sort((a,b)=>a.name.localeCompare(b.name));
  const sel = document.getElementById('pur-item');
  sel.innerHTML = '<option value="">-- select product --</option>' + items.map(i=>`<option value="${i.id}" data-price="${i.price||0}" data-qty="${i.qty}" data-unit="${esc(i.unit||'')}">${esc(i.name)} — on hand: ${i.qty} ${esc(i.unit||'')} @ ${money(i.price||0)}</option>`).join('');
  if(purchaseId){
    const p = (DB.purchases||[]).find(x=>x.id===purchaseId);
    if(p){
      const inv = items.find(i=>i.name===p.itemName);
      if(inv) sel.value = inv.id;
      document.getElementById('pur-qty').value = p.qty;
      document.getElementById('pur-unit').value = p.unitPrice;
      document.getElementById('pur-date').value = p.date;
      document.getElementById('pur-paid').checked = !!p.paid;
      document.getElementById('pur-method').value = p.method||'Cash';
      document.getElementById('pur-waive').checked = !!p.surchargeWaived;
      document.getElementById('pur-ref').value = p.ref||'';
      document.getElementById('pur-notes').value = p.notes||'';
    }
  } else {
    document.getElementById('pur-qty').value = 1;
    document.getElementById('pur-unit').value = 0;
    document.getElementById('pur-date').value = todayStr();
    document.getElementById('pur-paid').checked = true;
    document.getElementById('pur-method').value = 'Cash';
    document.getElementById('pur-waive').checked = false;
    document.getElementById('pur-ref').value = '';
    document.getElementById('pur-notes').value = '';
  }
  recalcPurchaseTotal();
  onPurchaseItemPicked();
  recalcPurchaseSurcharge();
  openModal('purchase-modal');
}
function recalcPurchaseSurcharge(){
  const total = +document.getElementById('pur-total').value||0;
  const method = document.getElementById('pur-method').value;
  const paid = document.getElementById('pur-paid').checked;
  const waived = document.getElementById('pur-waive').checked;
  const block = document.getElementById('pur-card-block');
  // Only relevant when method is card AND purchase is being marked paid (i.e. money is actually moving)
  if(!isCardMethod(method) || !paid){
    block.style.display = 'none';
    return;
  }
  block.style.display = 'block';
  const surcharge = computeSurcharge(total, method, waived);
  const clientPays = total + surcharge;
  document.getElementById('pur-surcharge-calc').innerHTML = waived
    ? `<span style="color:var(--success)"><b>Waived.</b></span> Client pays <b>${money(total)}</b>.`
    : `Surcharge: <b>${money(surcharge)}</b> &nbsp; · &nbsp; Client pays total: <b>${money(clientPays)}</b>`;
}
function onPurchaseItemPicked(){
  const sel = document.getElementById('pur-item');
  const opt = sel.options[sel.selectedIndex];
  if(!opt || !opt.value){
    document.getElementById('pur-stock-note').textContent = '';
    return;
  }
  const price = +opt.dataset.price||0;
  const onHand = +opt.dataset.qty||0;
  const unit = opt.dataset.unit||'';
  // Only autofill price when creating a new purchase
  if(!document.getElementById('pur-id').value){
    document.getElementById('pur-unit').value = price;
  }
  document.getElementById('pur-stock-note').innerHTML =
    `On hand at this branch: <b>${onHand} ${esc(unit)}</b>` +
    (onHand<=0 ? ' <span class="pill bad">Out</span>' : '');
  recalcPurchaseTotal();
}
function recalcPurchaseTotal(){
  const q = +document.getElementById('pur-qty').value||0;
  const u = +document.getElementById('pur-unit').value||0;
  document.getElementById('pur-total').value = (q*u).toFixed(2);
  recalcPurchaseSurcharge();
}
function savePurchase(){
  const clientId = +document.getElementById('pur-client-id').value;
  const id = +document.getElementById('pur-id').value;
  const itemId = +document.getElementById('pur-item').value;
  const inv = DB.inventory.find(i=>i.id===itemId);
  if(!inv){ alert('Please select a product from inventory.'); return; }
  const qty = +document.getElementById('pur-qty').value||0;
  if(qty<=0){ alert('Quantity must be at least 1.'); return; }
  const unitPrice = +document.getElementById('pur-unit').value||0;
  const paid = document.getElementById('pur-paid').checked;
  const total = +(qty*unitPrice).toFixed(2);
  const method = document.getElementById('pur-method').value;
  const waived = document.getElementById('pur-waive').checked;
  // Surcharge only applies when paid AND card
  const surcharge = paid ? computeSurcharge(total, method, waived) : 0;
  const rec = {
    clientId,
    branch: inv.branch,
    itemName: inv.name,
    qty,
    unitPrice,
    total,
    date: document.getElementById('pur-date').value||todayStr(),
    paid,
    method,
    surcharge,
    surchargeWaived: !!waived,
    ref: document.getElementById('pur-ref').value.trim(),
    notes: document.getElementById('pur-notes').value
  };
  let warnings = [];
  if(id){
    // Editing: revert the old qty first, apply new qty
    const idx = (DB.purchases||[]).findIndex(x=>x.id===id);
    if(idx>=0){
      const old = DB.purchases[idx];
      applyStockChange(old.branch, [{itemName:old.itemName, qty:old.qty}], -1);
      warnings = applyStockChange(rec.branch, [{itemName:rec.itemName, qty:rec.qty}], +1);
      DB.purchases[idx] = {...old, ...rec};
      // Sync to Firestore if available
      if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
        window.FirestoreCRUD.update('purchases', String(id), DB.purchases[idx]).catch(err => console.error("Firestore update error:", err));
      }
    }
  } else {
    rec.id = nextId('purchase');
    DB.purchases = DB.purchases||[];
    DB.purchases.push(rec);
    warnings = applyStockChange(rec.branch, [{itemName:rec.itemName, qty:rec.qty}], +1);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('purchases', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('purchase-modal');
  if(currentClientViewId) viewClient(currentClientViewId);
  renderInventory && renderInventory();
  renderDashboard();
  if(warnings.length) alert('Purchase saved and inventory updated.\n\n'+warnings.join('\n'));
}
function removePurchase(id){
  if(!confirm('Remove this purchase? The qty will be restored to inventory.')) return;
  const idx = (DB.purchases||[]).findIndex(x=>x.id===id);
  if(idx<0) return;
  const p = DB.purchases[idx];
  applyStockChange(p.branch, [{itemName:p.itemName, qty:p.qty}], -1);
  DB.purchases.splice(idx,1);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('purchases', String(id)).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  if(currentClientViewId) viewClient(currentClientViewId);
  renderInventory && renderInventory();
  renderDashboard();
}
function togglePurchasePaid(id){
  const p = (DB.purchases||[]).find(x=>x.id===id);
  if(!p) return;
  p.paid = !p.paid;
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('purchases', String(id), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  if(currentClientViewId) viewClient(currentClientViewId);
  renderDashboard();
}

// -------- Daily Sales & Expenses --------
function getSalesDate(){
  const el = document.getElementById('sales-date');
  if(!el || !el.value) return todayStr();
  return el.value;
}
function getSalesBranchScope(){
  return 'current';
}
function salesBranchMatch(b){
  return branchMatches(b, DB.session.branch);
}
function goSalesToday(){
  const el = document.getElementById('sales-date');
  if(el){ el.value = todayStr(); }
  renderSales();
}
function shiftSalesDate(delta){
  const el = document.getElementById('sales-date');
  if(!el) return;
  const cur = el.value || todayStr();
  const d = new Date(cur+'T00:00');
  d.setDate(d.getDate()+delta);
  el.value = dateToLocalStr(d);
  renderSales();
}
function collectDayPayments(date){
  // Returns flattened list of all payments matching the date and branch scope.
  const out = [];
  // Package payments
  (DB.packages||[]).forEach(pkg=>{
    (pkg.payments||[]).forEach(pay=>{
      if(pay.date !== date) return;
      const branch = pay.branch || pkg.branch;
      if(!salesBranchMatch(branch)) return;
      const client = DB.clients.find(c=>c.id===pkg.clientId);
      out.push({
        kind:'package',
        time: pay.id || 0,
        clientName: client ? (client.fname+' '+client.lname) : '—',
        description: pkg.packageName + ' (' + (pay.type||'Payment') + ')',
        method: pay.method || 'Cash',
        amount: +pay.amount || 0,
        surcharge: +pay.surcharge || 0,
        surchargeWaived: !!pay.surchargeWaived,
        ref: pay.ref || '',
        notes: pay.notes || '',
        branch
      });
    });
  });
  // Product purchases — only those marked paid.
  // Walk-in service payments are ALSO stored in DB.purchases with type:'service'
  // so they ride the same Firestore `purchases` listener. The kind we emit
  // here ('walkin' vs 'purchase') drives the Source badge in renderSales.
  (DB.purchases||[]).forEach(pu=>{
    if(!pu.paid) return;
    if(pu.date !== date) return;
    if(!salesBranchMatch(pu.branch)) return;
    const client = DB.clients.find(c=>String(c.id)===String(pu.clientId));
    const isWalkin = pu.type === 'service';
    out.push({
      kind: isWalkin ? 'walkin' : 'purchase',
      time: pu.id || 0,
      purchaseId: pu.id,
      clientName: client ? (client.fname+' '+client.lname) : (pu.clientName || '—'),
      description: isWalkin
        ? (pu.itemName || 'Walk-in service')
        : (pu.itemName + ' × ' + pu.qty),
      method: pu.method || 'Cash',
      amount: +pu.total || 0,
      surcharge: +pu.surcharge || 0,
      surchargeWaived: !!pu.surchargeWaived,
      ref: pu.ref || '',
      notes: pu.notes || '',
      branch: pu.branch
    });
  });
  return out.sort((a,b)=>a.time - b.time);
}
function collectDayExpenses(date){
  return (DB.expenses||[])
    .filter(e=>e.date===date && salesBranchMatch(e.branch))
    .sort((a,b)=>(a.id||0)-(b.id||0));
}
function renderSales(){
  // Set the branch label
  document.getElementById('sales-branch-name').textContent = branchName(DB.session.branch);
  const date = getSalesDate();
  const payments = collectDayPayments(date);
  const expenses = collectDayExpenses(date);

  // ---- Summary cards ----
  // Payments come from three sources (see collectDayPayments):
  //   - 'package'  → money applied to a client's package (Service/Comeback)
  //   - 'purchase' → product-only rows in DB.purchases (type!=='service')
  //   - 'walkin'   → one-off treatment rows in DB.purchases (type==='service'),
  //                  i.e. walk-in clients who did NOT buy a package.
  // Each of these rolls into Total Sales. Walk-in previously wasn't included
  // even though the rows appeared in the Payments table — fixed below.
  const grossPackage = payments.filter(p=>p.kind==='package').reduce((s,p)=>s+p.amount,0);
  const grossPurchase = payments.filter(p=>p.kind==='purchase').reduce((s,p)=>s+p.amount,0);
  const grossWalkin = payments.filter(p=>p.kind==='walkin').reduce((s,p)=>s+p.amount,0);
  const walkinCount = payments.filter(p=>p.kind==='walkin').length;
  const totalSales = grossPackage + grossPurchase + grossWalkin;
  const cardSurcharge = payments.reduce((s,p)=>s+p.surcharge,0);
  const totalExpenses = expenses.reduce((s,e)=>s+(+e.amount||0),0);
  const netProfit = totalSales - totalExpenses;
  document.getElementById('sales-summary').innerHTML = `
    <div class="stat"><div class="label">Package Payments</div><div class="value">${money(grossPackage)}</div></div>
    <div class="stat" style="border-left-color:#f59e0b"><div class="label">Walk-in Treatments${walkinCount?` (${walkinCount})`:''}</div><div class="value">${money(grossWalkin)}</div></div>
    <div class="stat"><div class="label">Product Sales</div><div class="value">${money(grossPurchase)}</div></div>
    <div class="stat" style="border-left-color:var(--success)"><div class="label">Total Sales</div><div class="value">${money(totalSales)}</div></div>
    <div class="stat" style="border-left-color:var(--gold)"><div class="label">Card Surcharge (passthrough)</div><div class="value">${money(cardSurcharge)}</div></div>
    <div class="stat" style="border-left-color:var(--danger)"><div class="label">Total Expenses</div><div class="value">${money(totalExpenses)}</div></div>
    <div class="stat" style="border-left-color:${netProfit>=0?'var(--success)':'var(--danger)'}"><div class="label">Net Profit</div><div class="value">${money(netProfit)}</div></div>
  `;

  // ---- Payments list ----
  const payEl = document.getElementById('sales-payments');
  if(!payments.length){
    payEl.innerHTML = '<div class="empty">No payments recorded for this date.</div>';
  } else {
    const rows = payments.map(p=>{
      const isCard = (p.method||'').toLowerCase().includes('card');
      const methodPill = isCard
        ? `<span class="pill" style="background:var(--gold-soft);color:var(--gold-dark);border:1px solid var(--gold-light)">${esc(p.method)}</span>`
        : `<span class="pill info">${esc(p.method||'Cash')}</span>`;
      const surchargeCell = p.surcharge>0
        ? money(p.surcharge)
        : (isCard && p.surchargeWaived ? '<span style="color:var(--muted);font-style:italic">waived</span>' : '—');
      const branchTag = '';
      const sourceTag = p.kind==='walkin'
        ? `<span class="pill" style="background:#fef3c7;color:#92400e">Walk-in</span>`
        : p.kind==='purchase'
          ? `<span class="pill" style="background:#fde68a;color:#92400e">Product</span>`
          : `<span class="pill" style="background:#dbeafe;color:#1e40af">Package</span>`;
      // Only walk-in rows get a Delete button in the Actions column — package
      // payments are managed from the package's detail view, and product
      // purchases from the Packages / Inventory workflow; deleting those
      // would be a bigger cascade. Walk-ins are self-contained.
      const actionsCell = p.kind==='walkin'
        ? `<button class="btn small danger" onclick="deleteWalkin(${idArg(p.purchaseId)})">Delete</button>`
        : '';
      return `<tr>
        <td>${sourceTag}</td>
        <td><b>${esc(p.clientName)}</b>${branchTag}</td>
        <td>${esc(p.description)}${p.ref?`<div style="font-size:11px;color:var(--muted)">Ref: ${esc(p.ref)}</div>`:''}</td>
        <td>${methodPill}</td>
        <td style="text-align:right;font-weight:600">${money(p.amount)}</td>
        <td style="text-align:right">${surchargeCell}</td>
        <td style="text-align:right">${actionsCell}</td>
      </tr>`;
    }).join('');
    payEl.innerHTML = `<table>
      <thead><tr><th>Source</th><th>Client</th><th>Item / Service</th><th>Method</th><th style="text-align:right">Amount</th><th style="text-align:right">Surcharge</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:var(--blue-ghost);font-weight:700">
        <td colspan="4" style="text-align:right">Day Total</td>
        <td style="text-align:right">${money(totalSales)}</td>
        <td style="text-align:right">${money(cardSurcharge)}</td>
        <td></td>
      </tr></tfoot>
    </table>`;
  }

  // ---- Expenses list ----
  const expEl = document.getElementById('sales-expenses');
  if(!expenses.length){
    expEl.innerHTML = '<div class="empty">No expenses recorded for this date. Click <b>+ Add Expense</b> to log one.</div>';
  } else {
    const rows = expenses.map(e=>{
      const branchTag = '';
      return `<tr>
        <td><b>${esc(e.category||'')}</b>${branchTag}</td>
        <td>${esc(e.notes||'')}</td>
        <td style="text-align:right;font-weight:600;color:var(--danger)">${money(e.amount)}</td>
        <td style="text-align:right;white-space:nowrap">
          <button class="btn small secondary" onclick="openExpenseModal(${e.id})">Edit</button>
          <button class="btn small danger" onclick="deleteExpense(${e.id})">Delete</button>
        </td>
      </tr>`;
    }).join('');
    expEl.innerHTML = `<table>
      <thead><tr><th>Category</th><th>Notes</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:var(--blue-ghost);font-weight:700">
        <td colspan="2" style="text-align:right">Total Expenses</td>
        <td style="text-align:right;color:var(--danger)">${money(totalExpenses)}</td>
        <td></td>
      </tr></tfoot>
    </table>`;
  }

  // ---- Net profit summary block ----
  const netEl = document.getElementById('sales-net');
  const netColor = netProfit>=0 ? 'var(--success)' : 'var(--danger)';
  const dateLabel = fmtDate(date);
  netEl.innerHTML = `
    <div class="panel" style="border-left:4px solid ${netColor};background:var(--blue-ghost)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Net Profit — ${esc(dateLabel)}</div>
          <div style="font-size:13px;color:var(--ink);margin-top:4px">
            ${money(totalSales)} sales − ${money(totalExpenses)} expenses
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;font-style:italic">
            Card surcharge of ${money(cardSurcharge)} is excluded — it's a passthrough fee paid by clients to cover bank charges, not income.
          </div>
        </div>
        <div style="font-size:32px;font-weight:700;color:${netColor}">${money(netProfit)}</div>
      </div>
    </div>
  `;
}

function openExpenseModal(id){
  // Populate branch select first
  fillBranchSelect('exp-branch');
  if(id){
    const e = (DB.expenses||[]).find(x=>x.id===id);
    if(!e) return;
    document.getElementById('expense-modal-title').textContent = 'Edit Expense';
    document.getElementById('exp-id').value = e.id;
    document.getElementById('exp-date').value = e.date || todayStr();
    document.getElementById('exp-branch').value = e.branch || DB.session.branch;
    document.getElementById('exp-category').value = e.category || 'Miscellaneous';
    document.getElementById('exp-amount').value = e.amount || 0;
    document.getElementById('exp-notes').value = e.notes || '';
  } else {
    document.getElementById('expense-modal-title').textContent = 'Add Expense';
    document.getElementById('exp-id').value = '';
    document.getElementById('exp-date').value = getSalesDate();
    document.getElementById('exp-branch').value = DB.session.branch;
    document.getElementById('exp-category').value = 'Utilities';
    document.getElementById('exp-amount').value = 0;
    document.getElementById('exp-notes').value = '';
  }
  openModal('expense-modal');
}
function saveExpense(){
  const id = +document.getElementById('exp-id').value;
  const amount = +document.getElementById('exp-amount').value || 0;
  if(amount <= 0){ alert('Amount must be greater than zero.'); return; }
  const rec = {
    date: document.getElementById('exp-date').value || todayStr(),
    branch: document.getElementById('exp-branch').value,
    category: document.getElementById('exp-category').value,
    amount,
    notes: document.getElementById('exp-notes').value
  };
  if(id){
    const idx = (DB.expenses||[]).findIndex(x=>x.id===id);
    if(idx>=0) DB.expenses[idx] = {...DB.expenses[idx], ...rec};
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('expenses', String(id), rec).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    rec.id = nextId('expense');
    rec.createdAt = new Date().toISOString();
    DB.expenses = DB.expenses || [];
    DB.expenses.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('expenses', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('expense-modal');
  renderSales();
}
function deleteExpense(id){
  if(!confirm('Delete this expense entry? This cannot be undone.')) return;
  DB.expenses = (DB.expenses||[]).filter(x=>x.id!==id);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('expenses', String(id)).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  renderSales();
}

// -------- Appointments --------
function renderSchedule(){
  document.getElementById('sched-branch-name').textContent = branchName(DB.session.branch);
  renderCalendar();
  renderApptList();
}
function changeMonth(delta){ calDate.setMonth(calDate.getMonth()+delta); renderCalendar(); }
function goToday(){ calDate = new Date(); renderCalendar(); }
function renderCalendar(){
  const y = calDate.getFullYear(), m = calDate.getMonth();
  document.getElementById('cal-title').textContent = calDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const today = todayStr();
  const br = DB.session.branch;
  let html = '';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>html+=`<div class="cal-cell-head">${d}</div>`);
  for(let i=0;i<firstDay;i++) html+=`<div class="cal-cell other-month"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayAppts = DB.appointments.filter(a=>branchMatches(a.branch, br) && a.date===ds).sort((a,b)=>a.time.localeCompare(b.time));
    const apptHtml = dayAppts.slice(0,3).map(a=>{
      const c = findClientById(a.clientId);
      const name = c ? c.fname : '?';
      // Per user request: clicking anywhere in the cell (including on these
      // appointment pills) should ONLY open the day's list popup. Edit is
      // only reachable via the explicit Edit button inside that popup. So
      // the pill itself carries no onclick — the click bubbles up to the
      // parent .cal-cell which calls openDayScheduleModal(ds).
      return `<div class="appt" title="${esc(fmtTime(a.time)+' '+(c?c.fname+' '+c.lname:'')+' - '+(a.service||''))}">${fmtTime(a.time)} ${esc(name)}</div>`;
    }).join('');
    const more = dayAppts.length>3 ? `<div style="font-size:10px;color:var(--muted);margin-top:2px">+${dayAppts.length-3} more</div>` : '';
    html += `<div class="cal-cell ${ds===today?'today':''}" onclick="openDayScheduleModal('${ds}')"><div class="d">${d}</div>${apptHtml}${more}</div>`;
  }
  document.getElementById('calendar').innerHTML = `<div class="cal-grid">${html}</div>`;
}
function renderApptList(){
  const br = DB.session.branch;
  const today = todayStr();
  const list = DB.appointments.filter(a=>branchMatches(a.branch, br) && a.date>=today).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,20);
  const el = document.getElementById('appt-list');
  if(!list.length){ el.innerHTML = '<div class="empty">No upcoming appointments at this branch.</div>'; return; }
  const rows = list.map(a=>{
    const c = findClientById(a.clientId);
    return `<tr>
      <td>${fmtDate(a.date)}</td>
      <td>${fmtTime(a.time)}</td>
      <td><b>${c?esc(c.fname+' '+c.lname):'—'}</b></td>
      <td>${esc(a.service||'')}</td>
      <td>${esc(a.therapist||'')}</td>
      <td><span class="pill ${a.status==='Confirmed'?'ok':a.status==='Cancelled'||a.status==='No-show'?'bad':'info'}">${esc(a.status)}</span></td>
      <td><button class="btn small secondary" onclick="openApptModal(${a.id})">Edit</button></td>
    </tr>`;
  }).join('');
  el.innerHTML = `<table><thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Service</th><th>Therapist</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}
function fillPackageSelect(clientId, selectedId){
  const sel = document.getElementById('a-package');
  const clientKey = String(clientId);
  const pkgs = DB.packages.filter(p=>String(p.clientId)===clientKey && p.status==='Active');
  sel.innerHTML = '<option value="">— none —</option>' + pkgs.map(p=>{
    const s = pkgStats(p);
    return `<option value="${p.id}" ${selectedId==p.id?'selected':''}>${esc(p.packageName)} (${s.sessionsUsed}/${p.totalSessions} used)</option>`;
  }).join('');
}

// Track which date the "Day Schedule" modal is currently showing, so the
// "+ New Appointment" button inside it knows what date to prefill.
let _dayScheduleDate = null;

// Handler invoked by the explicit Edit button beside each row. Exposed on
// window so the inline onclick finds it regardless of bundling order.
// Called out as a named function instead of an inline arrow because some
// Safari/Mac builds were choking on the longer inline
// onclick="closeModal(...);openApptModal(...)" string and silently skipping
// the click. A named function reference is the safest contract cross-browser.
function editApptFromDayModal(apptId){
  try {
    closeModal('day-schedule-modal');
    openApptModal(apptId);
  } catch (e) {
    console.error('editApptFromDayModal failed:', e);
    alert('Could not open that appointment: ' + (e && e.message || e));
  }
}
window.editApptFromDayModal = editApptFromDayModal;

// Open a modal listing every appointment on a given date, filtered to the
// current branch. Each row has an explicit "Edit" button at the end. The
// whole row is NOT click-to-edit anymore — per user request, and also
// silently broken on Safari/Mac (inline onclick on <tr> is the fiddliest
// event target in the DOM; too many cross-browser edge cases).
//
// Wrapped in try/catch end-to-end so any render error surfaces in DevTools
// instead of just leaving the calendar looking unresponsive on Mac.
function openDayScheduleModal(ds){
  try {
    _dayScheduleDate = ds;
    const br = (DB && DB.session) ? DB.session.branch : null;
    const dayAppts = (DB.appointments || [])
      .filter(a => branchMatches(a.branch, br) && a.date === ds)
      .sort((a,b) => (a.time||'').localeCompare(b.time||''));

    // Build the title defensively — `new Date(ds + 'T00:00')` has produced
    // "Invalid Date" on some older Safari builds when ds is empty/odd.
    let title = ds;
    try {
      const dt = new Date(ds + 'T00:00:00');
      if (!isNaN(dt.getTime())) {
        title = dt.toLocaleDateString('en-US',
          { weekday:'long', year:'numeric', month:'long', day:'numeric' });
      }
    } catch (_) { /* fall back to raw ds */ }

    const titleEl = document.getElementById('day-schedule-title');
    const body = document.getElementById('day-schedule-body');
    if (!titleEl || !body) {
      console.error('openDayScheduleModal: required DOM ids missing. ' +
        'Is the latest index.html deployed? Needed ids: day-schedule-title, day-schedule-body.');
      alert('Day Schedule popup is not loaded. Hard-refresh (Cmd-Shift-R on Mac) and try again.');
      return;
    }
    titleEl.textContent = title;

    if(!dayAppts.length){
      body.innerHTML = `<div class="empty" style="padding:20px;text-align:center;color:var(--muted)">No appointments scheduled for this day at ${esc(branchName(br))}.</div>`;
    } else {
      const rows = dayAppts.map(a => {
        const c = findClientById(a.clientId);
        const statusClass = a.status==='Confirmed' ? 'ok'
                          : a.status==='Completed' ? 'ok'
                          : (a.status==='Cancelled' || a.status==='No-show') ? 'bad'
                          : 'info';
        const clientLbl = c
          ? esc(c.fname + ' ' + c.lname)
          : '<span style="color:var(--muted)">— unknown —</span>';
        // JSON.stringify safely escapes the id whether it's a number or a
        // Firestore-generated string like "ab12Cd" — so the inline onclick
        // always parses even on Safari's stricter quote handling.
        // Use htmlsafe idArg helper (escapes the outer " so it survives inside
        // a double-quoted onclick attribute). Local var named `ida` to avoid
        // shadowing the top-level idArg() helper.
        const ida = idArg(a.id);
        return `<tr>
          <td><b>${fmtTime(a.time)}</b></td>
          <td>${clientLbl}</td>
          <td>${esc(a.service||'')}</td>
          <td>${esc(a.therapist||'')}</td>
          <td><span class="pill ${statusClass}">${esc(a.status||'Booked')}</span></td>
          <td><button class="btn small secondary" onclick="editApptFromDayModal(${ida})">Edit</button></td>
        </tr>`;
      }).join('');
      body.innerHTML = `
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
          ${dayAppts.length} appointment${dayAppts.length===1?'':'s'} at <b>${esc(branchName(br))}</b>. Click <b>Edit</b> on any row.
        </div>
        <table>
          <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Therapist</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }
    openModal('day-schedule-modal');
  } catch (e) {
    console.error('openDayScheduleModal failed for ds=' + ds + ':', e);
    alert('Could not open the day schedule: ' + (e && e.message || e) +
      '\n\nIf this keeps happening on Mac, open the browser console and send me the red error line.');
  }
}
window.openDayScheduleModal = openDayScheduleModal;

// Called by the "+ New Appointment" button inside the day-schedule modal.
// Closes the day modal, then opens the appointment modal prefilled with the
// date the user had been looking at.
function addApptFromDayModal(){
  const ds = _dayScheduleDate || todayStr();
  closeModal('day-schedule-modal');
  openApptModal(null, ds);
}
window.addApptFromDayModal = addApptFromDayModal;

function openApptModal(id, prefillDate){
  fillClientSelect('a-client');
  fillBranchSelect('a-branch');
  document.getElementById('appt-delete-btn').style.display = id ? 'inline-block' : 'none';
  if(id){
    const a = findAppointmentById(id);
    if(!a){
      alert('Appointment not found.');
      return;
    }
    document.getElementById('appt-modal-title').textContent = 'Edit Appointment';
    document.getElementById('appt-id').value = a.id;
    document.getElementById('a-client').value = String(a.clientId);
    document.getElementById('a-date').value = a.date;
    document.getElementById('a-time').value = a.time;
    document.getElementById('a-duration').value = a.duration;
    document.getElementById('a-branch').value = normalizeBranchId(a.branch);
    document.getElementById('a-service').value = a.service||'';
    document.getElementById('a-therapist').value = a.therapist||'';
    document.getElementById('a-status').value = a.status||'Booked';
    document.getElementById('a-notes').value = a.notes||'';
    fillPackageSelect(a.clientId, a.packageId);
  } else {
    document.getElementById('appt-modal-title').textContent = 'New Appointment';
    document.getElementById('appt-id').value = '';
    document.getElementById('a-date').value = prefillDate || todayStr();
    document.getElementById('a-time').value = '10:00';
    document.getElementById('a-duration').value = 60;
    document.getElementById('a-branch').value = normalizeBranchId(DB.session.branch);
    document.getElementById('a-service').value = '';
    document.getElementById('a-therapist').value = '';
    document.getElementById('a-status').value = 'Booked';
    document.getElementById('a-notes').value = '';
    fillPackageSelect(0);
  }
  // Refresh package list if user changes client
  document.getElementById('a-client').onchange = e => fillPackageSelect(e.target.value, document.getElementById('a-package').value);
  openModal('appt-modal');
}
function saveAppt(){
  const id = document.getElementById('appt-id').value;
  const clientId = +document.getElementById('a-client').value;
  const date = document.getElementById('a-date').value;
  const time = document.getElementById('a-time').value;
  if(!clientId||!date||!time){ alert('Client, date and time are required'); return; }
  const branch = document.getElementById('a-branch').value;
  const dupAppt = findDuplicateAppointment(clientId, date, branch, id);
  if(dupAppt){
    alert('This client already has an appointment on the same day in this branch.');
    return;
  }
  const pkgIdVal = document.getElementById('a-package').value;
  const rec = {
    clientId, date, time,
    duration: +document.getElementById('a-duration').value||60,
    branch,
    service: document.getElementById('a-service').value.trim(),
    therapist: document.getElementById('a-therapist').value.trim(),
    status: document.getElementById('a-status').value,
    packageId: pkgIdVal ? +pkgIdVal : null,
    notes: document.getElementById('a-notes').value
  };
  let apptId;
  if(id){
    // Preserve string ids for Firestore-assigned doc keys — `+id` would
    // become NaN for those, which silently broke the update path.
    apptId = /^\d+$/.test(String(id)) ? +id : String(id);
    const idx = DB.appointments.findIndex(x => String(x.id) === String(id));
    if(idx < 0){ alert('Appointment not found. Close and reopen the modal.'); return; }
    DB.appointments[idx] = {...DB.appointments[idx], ...rec, id: apptId};
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('appointments', String(apptId), rec).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    apptId = nextId('appt');
    rec.id = apptId;
    DB.appointments.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('appointments', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  // Package auto-link: if completed + has package, ensure a session entry exists
  syncApptToPackage(apptId);
  saveData();
  closeModal('appt-modal');
  renderSchedule();
  renderDashboard();
  if(currentPage==='packages') renderPackages();
  if(currentPage==='upcoming') renderUpcoming();
  updateUpcomingBadge();
}

function syncApptToPackage(apptId){
  const a = DB.appointments.find(x=>String(x.id)===String(apptId));
  if(!a) return;
  const allWarnings = [];
  // Track every package we touch so we can push all of them to Firestore at
  // the end — without this, any auto-created/removed session lives only in
  // the local DB and the next snapshot wipes it ("session counter resets").
  const touchedPkgIds = new Set();
  // Remove any previously-auto-created session for this appointment from any package
  // and restore the supplies that were deducted at that time.
  DB.packages.forEach(p=>{
    if(!p.sessions) return;
    const before = p.sessions.length;
    p.sessions = p.sessions.filter(s=>{
      if(String(s.apptId)!==String(apptId)) return true;
      const toRestore = Array.isArray(s.supplies) && s.supplies.length
        ? s.supplies
        : snapshotTreatmentSupplies(p.treatmentId);
      applyStockChange(p.branch, toRestore, -1);
      return false;
    });
    if(p.sessions.length !== before) touchedPkgIds.add(p.id);
  });
  // If appt is Completed and linked to a package, add a session entry and deduct supplies
  if(a.packageId && a.status==='Completed'){
    const p = DB.packages.find(x=>String(x.id)===String(a.packageId));
    if(p){
      p.sessions = p.sessions||[];
      const supplies = snapshotTreatmentSupplies(p.treatmentId);
      const warnings = applyStockChange(p.branch, supplies, +1);
      allWarnings.push(...warnings);
      p.sessions.push({
        id: nextId('session'),
        date: a.date,
        time: a.time,
        therapist: a.therapist||'',
        notes: a.notes||'(from appointment)',
        apptId: a.id,
        supplies
      });
      if(p.sessions.length>=p.totalSessions && p.status==='Active') p.status='Completed';
      touchedPkgIds.add(p.id);
    }
  }
  // Persist every mutated package to Firestore. Fire-and-forget — the local
  // DB is already correct; this just keeps Firestore aligned so other devices
  // and later snapshots see the same truth.
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
    touchedPkgIds.forEach(pid=>{
      const pp = DB.packages.find(x=>String(x.id)===String(pid));
      if(pp) window.FirestoreCRUD.update('packages', String(pp.id), pp).catch(err => console.error("Firestore pkg sync error:", err));
    });
  }
  if(allWarnings.length){
    setTimeout(()=>alert('Session auto-logged from appointment. Inventory updated.\n\n'+allWarnings.join('\n')), 50);
  }
}
function deleteAppt(){
  // Read the raw id without numeric coercion — Firestore-assigned ids are
  // strings (e.g. "abc123"), and `+id` on those becomes NaN, which silently
  // skipped every filter below. Compare via String() everywhere.
  const raw = document.getElementById('appt-id').value;
  if(!raw){ alert('No appointment selected.'); return; }
  const id = String(raw);
  if(!confirm('Delete this appointment? If it logged a package session, that session and its supply deduction will be reversed.')) return;
  // Remove any package session that came from this appt and restore supplies
  const touchedPkgIds = new Set();
  DB.packages.forEach(p=>{
    if(!p.sessions) return;
    const before = p.sessions.length;
    p.sessions = p.sessions.filter(s=>{
      if(String(s.apptId) !== id) return true;
      const toRestore = Array.isArray(s.supplies) && s.supplies.length
        ? s.supplies
        : snapshotTreatmentSupplies(p.treatmentId);
      applyStockChange(p.branch, toRestore, -1);
      return false;
    });
    if(p.sessions.length !== before) touchedPkgIds.add(p.id);
  });
  DB.appointments = DB.appointments.filter(x => String(x.id) !== id);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('appointments', id).catch(err => console.error("Firestore delete error:", err));
    // Also persist the mutated packages so the reversed session doesn't come
    // back from the next snapshot.
    touchedPkgIds.forEach(pid => {
      const p = DB.packages.find(x=>x.id===pid);
      if(p) window.FirestoreCRUD.update('packages', String(pid), p).catch(err => console.error("Firestore pkg update error:", err));
    });
  }
  saveData();
  closeModal('appt-modal');
  renderSchedule();
  renderInventory && renderInventory();
  renderDashboard();
  updateUpcomingBadge();
  if(currentPage==='upcoming') renderUpcoming();
  if(currentPage==='packages') renderPackages();
}

// -------- Inventory --------
// Inventory-table sort state. null = default (by item name alphabetical).
// Click a column header once to activate that sort, click again to go back
// to default. Same pattern as clientSort.
let invSort = null;
function sortInventory(col){
  invSort = (invSort === col) ? null : col;
  renderInventory();
}
window.sortInventory = sortInventory;

function renderInventory(){
  const br = DB.session.branch;
  document.getElementById('inv-branch-name').textContent = branchName(br);
  const q = (document.getElementById('inv-search')?.value||'').toLowerCase();
  const items = DB.inventory.filter(i=>branchMatches(i.branch, br) && (!q||i.name.toLowerCase().includes(q)||(i.category||'').toLowerCase().includes(q)));

  // ---- Status rank helper (most urgent first when sorting by status) ----
  const statusRank = i => {
    if(i.qty === 0) return 0;                 // Out
    if(i.qty <= i.reorder) return 1;          // Low
    return 2;                                 // OK
  };
  const defaultCmp = (a,b) => (a.name||'').localeCompare(b.name||'');
  if(invSort === 'category'){
    items.sort((a,b)=> (a.category||'').localeCompare(b.category||'') || defaultCmp(a,b));
  } else if(invSort === 'qty'){
    items.sort((a,b)=> (+a.qty||0) - (+b.qty||0) || defaultCmp(a,b));
  } else if(invSort === 'reorder'){
    items.sort((a,b)=> (+a.reorder||0) - (+b.reorder||0) || defaultCmp(a,b));
  } else if(invSort === 'cost'){
    items.sort((a,b)=> (+a.cost||0) - (+b.cost||0) || defaultCmp(a,b));
  } else if(invSort === 'price'){
    items.sort((a,b)=> (+a.price||0) - (+b.price||0) || defaultCmp(a,b));
  } else if(invSort === 'status'){
    items.sort((a,b)=> statusRank(a) - statusRank(b) || defaultCmp(a,b));
  } else {
    items.sort(defaultCmp);
  }

  const el = document.getElementById('inv-table');
  if(!items.length){ el.innerHTML = '<div class="empty">No inventory items. Click "+ New Item" to add one.</div>'; return; }

  // Visual indicator on active sort column
  const arr  = '<span style="color:var(--blue)">▼</span>';
  const none = '<span style="color:var(--muted);font-size:10px">↕</span>';
  const ind = k => invSort===k ? arr : none;

  const rows = items.map(i=>{
    const status = i.qty===0 ? '<span class="pill bad">Out</span>' : i.qty<=i.reorder ? '<span class="pill warn">Low</span>' : '<span class="pill ok">OK</span>';
    return `<tr>
      <td><b>${esc(i.name)}</b></td>
      <td>${esc(i.category||'')}</td>
      <td>${i.qty} ${esc(i.unit||'')}</td>
      <td>${i.reorder}</td>
      <td>₱${Number(i.cost||0).toFixed(2)}</td>
      <td>₱${Number(i.price||0).toFixed(2)}</td>
      <td>${status}</td>
      <td>
        <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
          <button class="btn small secondary" onclick="adjustQty(${i.id},1)" title="Add 1">+1</button>
          <button class="btn small secondary" onclick="adjustQty(${i.id},-1)" title="Subtract 1">-1</button>
          <input type="number" id="bulk-${i.id}" value="" step="1" placeholder="±qty" title="Bulk adjust" style="width:64px;padding:4px 6px;font-size:12px;border:1px solid var(--border-blue);border-radius:4px"/>
          <button class="btn small" onclick="bulkAdjust(${i.id})" title="Apply bulk change">Apply</button>
          <button class="btn small secondary" onclick="openInvModal(${i.id})">Edit</button>
        </div>
      </td>
    </tr>`;
  }).join('');
  el.innerHTML = `<table>
    <thead><tr>
      <th>Item</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('category')" title="Click to sort by category. Click again for default.">Category ${ind('category')}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('qty')" title="Click to sort by on-hand quantity (lowest first). Click again for default.">On Hand ${ind('qty')}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('reorder')" title="Click to sort by reorder threshold. Click again for default.">Reorder ${ind('reorder')}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('cost')" title="Click to sort by cost. Click again for default.">Cost ${ind('cost')}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('price')" title="Click to sort by price. Click again for default.">Price ${ind('price')}</th>
      <th style="cursor:pointer;user-select:none" onclick="sortInventory('status')" title="Click to sort by stock status: Out → Low → OK. Click again for default.">Status ${ind('status')}</th>
      <th>Actions</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}
function adjustQty(id, delta){
  const it = DB.inventory.find(x=>x.id===id);
  if(!it) return;
  it.qty = Math.max(0, (it.qty||0)+delta);
  saveData();
  renderInventory();
  renderDashboard();
}
function bulkAdjust(id){
  const el = document.getElementById('bulk-'+id);
  if(!el) return;
  const delta = parseInt(el.value, 10);
  if(!delta || isNaN(delta)){ alert('Enter a positive or negative number (e.g. 50 to add 50, -10 to remove 10).'); return; }
  const it = DB.inventory.find(x=>x.id===id);
  if(!it) return;
  const before = it.qty||0;
  it.qty = Math.max(0, before + delta);
  saveData();
  renderInventory();
  renderDashboard();
}
function openInvModal(id){
  document.getElementById('inv-delete-btn').style.display = id ? 'inline-block' : 'none';
  if(id){
    const it = DB.inventory.find(x=>x.id===id);
    document.getElementById('inv-modal-title').textContent = 'Edit Item';
    document.getElementById('inv-id').value = it.id;
    ['name','category','unit','qty','reorder','cost','price','supplier','notes'].forEach(k=>{
      document.getElementById('i-'+k).value = it[k]||'';
    });
  } else {
    document.getElementById('inv-modal-title').textContent = 'New Inventory Item';
    document.getElementById('inv-id').value = '';
    document.getElementById('i-name').value='';
    document.getElementById('i-category').value='Product';
    document.getElementById('i-unit').value='';
    document.getElementById('i-qty').value=0;
    document.getElementById('i-reorder').value=5;
    document.getElementById('i-cost').value=0;
    document.getElementById('i-price').value=0;
    document.getElementById('i-supplier').value='';
    document.getElementById('i-notes').value='';
  }
  openModal('inv-modal');
}
function saveInv(){
  const id = document.getElementById('inv-id').value;
  const name = document.getElementById('i-name').value.trim();
  if(!name){ alert('Item name is required'); return; }
  const branch = DB.session.branch;
  const dupItem = findDuplicateInventoryItem(name, branch, id);
  if(dupItem){
    alert('This inventory item already exists in the current branch.');
    return;
  }
  const rec = {
    branch,
    name,
    category: document.getElementById('i-category').value,
    unit: document.getElementById('i-unit').value.trim(),
    qty: +document.getElementById('i-qty').value||0,
    reorder: +document.getElementById('i-reorder').value||0,
    cost: +document.getElementById('i-cost').value||0,
    price: +document.getElementById('i-price').value||0,
    supplier: document.getElementById('i-supplier').value.trim(),
    notes: document.getElementById('i-notes').value
  };
  if(id){
    const idx = DB.inventory.findIndex(x=>x.id==id);
    DB.inventory[idx] = {...DB.inventory[idx], ...rec};
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('inventory', id, rec).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    rec.id = nextId('inv');
    DB.inventory.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('inventory', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('inv-modal');
  renderInventory();
  renderDashboard();
}
function deleteInv(){
  const id = +document.getElementById('inv-id').value;
  if(!confirm('Delete this item?')) return;
  DB.inventory = DB.inventory.filter(x=>x.id!==id);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('inventory', String(id)).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  closeModal('inv-modal');
  renderInventory();
}
function openTransferModal(){
  const sel = document.getElementById('t-item');
  const br = DB.session.branch;
  const items = DB.inventory.filter(i=>branchMatches(i.branch, br));
  sel.innerHTML = items.map(i=>`<option value="${i.id}">${esc(i.name)} — on hand: ${i.qty}</option>`).join('');
  fillBranchSelect('t-from');
  fillBranchSelect('t-to');
  document.getElementById('t-from').value = br;
  document.getElementById('t-to').value = DB.branches.find(b=>b.id!==br)?.id || br;
  document.getElementById('t-qty').value = 1;
  openModal('transfer-modal');
}
function doTransfer(){
  const itemId = +document.getElementById('t-item').value;
  const from = document.getElementById('t-from').value;
  const to = document.getElementById('t-to').value;
  const qty = +document.getElementById('t-qty').value;
  if(from===to){ alert('Choose different branches'); return; }
  const src = DB.inventory.find(x=>x.id===itemId);
  if(!src || src.qty<qty){ alert('Not enough stock'); return; }
  src.qty -= qty;
  const dest = DB.inventory.find(x=>branchMatches(x.branch, to) && x.name===src.name);
  if(dest){ dest.qty += qty; }
  else {
    DB.inventory.push({...src, id:nextId('inv'), branch:to, qty});
  }
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('inventory', String(src.id), src).catch(err => console.error("Firestore update error:", err));
    if(dest && DB.inventory.find(x=>x.id===dest.id)){
      window.FirestoreCRUD.update('inventory', String(dest.id), dest).catch(err => console.error("Firestore update error:", err));
    } else if(dest && !DB.inventory.find(x=>x.id===dest.id)) {
      const newDest = DB.inventory.find(x=>branchMatches(x.branch, to) && x.name===src.name);
      if(newDest) window.FirestoreCRUD.add('inventory', newDest).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('transfer-modal');
  renderInventory();
  alert(`Transferred ${qty} × ${src.name} from ${branchName(from)} to ${branchName(to)}`);
}

// -------- Treatments catalog --------
function renderTreatments(){
  const el = document.getElementById('treatments-list');
  if(!el) return;
  const list = DB.treatments.slice().sort((a,b)=>a.name.localeCompare(b.name));
  if(!list.length){ el.innerHTML = '<div class="empty">No services yet. Click "+ New Service" to add one.</div>'; return; }
  const rows = list.map(t=>{
    const inUse = DB.packages.some(p=>p.treatmentId===t.id);
    const supplyCount = (t.supplies||[]).length;
    const supplyPill = supplyCount
      ? `<span class="pill info" title="${esc((t.supplies||[]).map(s=>s.qty+'× '+s.itemName).join(', '))}">${supplyCount} supply item${supplyCount===1?'':'s'}</span>`
      : '<span class="pill" style="background:var(--gold-soft);color:var(--gold-dark)">no supplies</span>';
    return `<tr${t.active===false?' style="opacity:.55"':''}>
      <td><b>${esc(t.name)}</b>${t.active===false?' <span class="pill bad">Archived</span>':''}</td>
      <td>${esc(t.category||'')}</td>
      <td>${t.defaultSessions||1}</td>
      <td>every ${t.daysBetween||0} day${t.daysBetween==1?'':'s'}</td>
      <td class="money">${money(t.pricePerSession)}</td>
      <td>${supplyPill}</td>
      <td>${inUse?'<span class="pill info">'+DB.packages.filter(p=>p.treatmentId===t.id).length+' pkg(s)</span>':'—'}</td>
      <td>
        <button class="btn small secondary" onclick="openTreatmentModal(${t.id})">Edit</button>
      </td>
    </tr>`;
  }).join('');
  el.innerHTML = `<table><thead><tr><th>Service</th><th>Category</th><th>Default Sessions</th><th>Gap</th><th>Price / Session</th><th>Supplies</th><th>In Use</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

function openTreatmentModal(id){
  const hasId = (id!=null && id!=='');
  document.getElementById('tr-delete-btn').style.display = hasId ? 'inline-block' : 'none';
  if(hasId){
    // String-coerce both sides: Firestore ids arrive as strings, localStorage ids
    // as numbers. Strict === would find either (a) nothing, or (b) a stale
    // duplicate and open the wrong service.
    const t = DB.treatments.find(x => String(x.id) === String(id));
    if(!t){
      // Likely edited/deleted on another device between render and click.
      alert('This service could not be found — it may have just been deleted or renamed on another device. The list will refresh.');
      closeModal('treatment-modal');
      renderTreatments();
      return;
    }
    document.getElementById('treatment-modal-title').textContent = 'Edit Service';
    document.getElementById('treatment-id').value = t.id;
    document.getElementById('tr-name').value = t.name;
    document.getElementById('tr-category').value = t.category||'Facial';
    document.getElementById('tr-active').value = t.active===false?'false':'true';
    document.getElementById('tr-sessions').value = t.defaultSessions||1;
    document.getElementById('tr-days').value = t.daysBetween||7;
    document.getElementById('tr-price').value = t.pricePerSession||0;
    document.getElementById('tr-desc').value = t.description||'';
    renderSupplyRows(t.supplies||[]);
  } else {
    document.getElementById('treatment-modal-title').textContent = 'New Service';
    document.getElementById('treatment-id').value = '';
    document.getElementById('tr-name').value = '';
    document.getElementById('tr-category').value = 'Facial';
    document.getElementById('tr-active').value = 'true';
    document.getElementById('tr-sessions').value = 6;
    document.getElementById('tr-days').value = 14;
    document.getElementById('tr-price').value = 0;
    document.getElementById('tr-desc').value = '';
    renderSupplyRows([]);
  }
  openModal('treatment-modal');
}

// Supply editor: each row has [item-name datalist input] + [qty]
function renderSupplyRows(supplies){
  const wrap = document.getElementById('tr-supplies-list');
  if(!wrap) return;
  if(!supplies || !supplies.length){
    wrap.innerHTML = '<div class="empty" style="padding:14px;font-size:12px">No supplies linked. Click "+ Add Supply" if this service consumes inventory.</div>';
    return;
  }
  const opts = allInventoryNames().map(n=>`<option value="${esc(n)}"></option>`).join('');
  wrap.innerHTML = `<datalist id="inv-name-list">${opts}</datalist>` +
    supplies.map((s,i)=>`
      <div class="supply-row" style="display:grid;grid-template-columns:1fr 100px 36px;gap:8px;align-items:center;margin-bottom:6px">
        <input type="text" list="inv-name-list" value="${esc(s.itemName||'')}" placeholder="Inventory item name" data-supply-name="${i}" style="padding:6px 10px;border:1px solid var(--border-blue);border-radius:6px;font-size:13px"/>
        <input type="number" value="${s.qty||1}" min="0" step="1" data-supply-qty="${i}" placeholder="Qty" style="padding:6px 10px;border:1px solid var(--border-blue);border-radius:6px;font-size:13px"/>
        <button type="button" class="btn small danger" onclick="removeSupplyRow(${i})" title="Remove">✕</button>
      </div>
    `).join('');
}
function readSupplyRows(){
  const wrap = document.getElementById('tr-supplies-list');
  if(!wrap) return [];
  const rows = wrap.querySelectorAll('.supply-row');
  const out = [];
  rows.forEach((r,i)=>{
    const name = (r.querySelector('[data-supply-name]')?.value||'').trim();
    const qty = +(r.querySelector('[data-supply-qty]')?.value)||0;
    if(name && qty>0) out.push({itemName:name, qty});
  });
  return out;
}
function addSupplyRow(){
  const cur = readSupplyRows();
  cur.push({itemName:'', qty:1});
  renderSupplyRows(cur);
}
function removeSupplyRow(i){
  const cur = readSupplyRows();
  cur.splice(i,1);
  renderSupplyRows(cur);
}

function saveTreatment(){
  const id = document.getElementById('treatment-id').value;
  const name = document.getElementById('tr-name').value.trim();
  if(!name){ alert('Service name is required'); return; }
  const rec = {
    name,
    category: document.getElementById('tr-category').value,
    active: document.getElementById('tr-active').value === 'true',
    defaultSessions: +document.getElementById('tr-sessions').value||1,
    daysBetween: +document.getElementById('tr-days').value||7,
    pricePerSession: +document.getElementById('tr-price').value||0,
    description: document.getElementById('tr-desc').value,
    supplies: readSupplyRows()
  };
  // Warn (non-blocking) if any supply name doesn't match an existing inventory item somewhere
  const allNames = new Set(allInventoryNames());
  const unknown = rec.supplies.filter(s=>!allNames.has(s.itemName)).map(s=>s.itemName);
  if(unknown.length){
    if(!confirm(`These supply item names don't match any current inventory item:\n\n• ${unknown.join('\n• ')}\n\nSave anyway? (You can still add the matching inventory items later — stock just won't be deducted until then.)`)) return;
  }
  if(id){
    const idx = DB.treatments.findIndex(x => String(x.id) === String(id));
    if(idx < 0){
      alert('This service no longer exists (probably deleted on another device). The list will refresh.');
      closeModal('treatment-modal');
      renderTreatments();
      return;
    }
    // Preserve the original id explicitly so we never accidentally rewrite it
    // from the form value (which is a DOM string) and create a duplicate row.
    const originalId = DB.treatments[idx].id;
    DB.treatments[idx] = {...DB.treatments[idx], ...rec, id: originalId};
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('treatments', String(originalId), rec).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    rec.id = nextId('treatment');
    DB.treatments.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('treatments', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('treatment-modal');
  renderTreatments();
}

function deleteTreatment(){
  // Keep id as the DOM string. Coercing with +value silently produces NaN if
  // the id was a Firestore string like "abc123", and then the filter below
  // either deletes nothing (when id is a string) or deletes the wrong record
  // (when both sides happen to coerce to the same number).
  const id = document.getElementById('treatment-id').value;
  if(id===''){ return; }
  const inUse = DB.packages.some(p => String(p.treatmentId) === String(id));
  if(inUse){
    alert('This service is referenced by existing package(s). Archive it instead (set status to Archived).');
    return;
  }
  if(!confirm('Delete this service?')) return;
  DB.treatments = DB.treatments.filter(x => String(x.id) !== String(id));
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('treatments', String(id)).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  closeModal('treatment-modal');
  renderTreatments();
}

function fillTreatmentSelect(id){
  const sel = document.getElementById('p-treatment');
  const active = DB.treatments.filter(t=>t.active!==false).sort((a,b)=>a.name.localeCompare(b.name));
  sel.innerHTML = '<option value="">-- select service --</option>' + active.map(t=>`<option value="${t.id}">${esc(t.name)} — ${money(t.pricePerSession)}/session, every ${t.daysBetween}d</option>`).join('');
  if(id) sel.value = id;
}

function onTreatmentPicked(){
  // Only autofill when creating a new package OR not locked
  const editingLocked = document.getElementById('pkg-id').value && document.getElementById('p-locked-note').style.display!=='none';
  if(editingLocked) return;
  // DOM <select> values are always strings; treatment ids can be numbers or
  // strings depending on whether they came from seed data or Firestore.
  // Compare with String() on both sides so either type matches correctly.
  const tid = document.getElementById('p-treatment').value;
  if(!tid) return;
  const t = DB.treatments.find(x => String(x.id) === String(tid));
  if(!t) return;
  document.getElementById('p-total').value = t.defaultSessions;
  document.getElementById('p-pps').value = t.pricePerSession;
  document.getElementById('p-gap').value = t.daysBetween;
  // Remember the service's list price per session so we can show % discount later
  document.getElementById('p-price').dataset.listPps = String(t.pricePerSession);
  // Reset discount override when picking a new service
  document.getElementById('p-price').dataset.userEdited = '0';
  document.getElementById('p-price').value = ((+t.defaultSessions)*(+t.pricePerSession)).toFixed(2);
  updateDiscountBadge();
  updatePaidPreview();
}
// ---- Package price math (supports discounts) ----
// Behavior:
//   - Change Price-per-Session → Total auto-updates (sessions × pps)
//   - Change Total Sessions    → Total auto-updates using current pps
//   - Change Total Package Price manually → effective pps = total / sessions
//     (so Sessions Paid calculations still work), and a Discount badge shows.
function onSessionsEdited(){
  const total = +document.getElementById('p-total').value||0;
  const priceEl = document.getElementById('p-price');
  if(priceEl.readOnly){ updateDiscountBadge(); updatePaidPreview(); return; }
  if(priceEl.dataset.userEdited === '1' && total>0){
    // User is price-locked-by-override; recompute pps to match
    const newPps = (+priceEl.value||0)/total;
    document.getElementById('p-pps').value = newPps.toFixed(2);
  } else {
    const pps = +document.getElementById('p-pps').value||0;
    priceEl.value = (total*pps).toFixed(2);
  }
  updateDiscountBadge();
  updatePaidPreview();
}
function onPpsEdited(){
  const priceEl = document.getElementById('p-price');
  if(priceEl.readOnly){ updateDiscountBadge(); updatePaidPreview(); return; }
  // Editing pps resets any manual total-price override
  priceEl.dataset.userEdited = '0';
  const total = +document.getElementById('p-total').value||0;
  const pps = +document.getElementById('p-pps').value||0;
  priceEl.value = (total*pps).toFixed(2);
  updateDiscountBadge();
  updatePaidPreview();
}
function onTotalPriceEdited(){
  const priceEl = document.getElementById('p-price');
  if(priceEl.readOnly){ updateDiscountBadge(); updatePaidPreview(); return; }
  const total = +document.getElementById('p-total').value||0;
  const price = +priceEl.value||0;
  // A manual edit locks the total price until pps is re-edited or service is re-picked
  priceEl.dataset.userEdited = '1';
  if(total>0){
    const newPps = price/total;
    document.getElementById('p-pps').value = newPps.toFixed(2);
  }
  updateDiscountBadge();
  updatePaidPreview();
}
function updateDiscountBadge(){
  const total = +document.getElementById('p-total').value||0;
  const pps = +document.getElementById('p-pps').value||0;
  const price = +document.getElementById('p-price').value||0;
  const listPps = +(document.getElementById('p-price').dataset.listPps||0);
  const badge = document.getElementById('p-discount-badge');
  const hint = document.getElementById('p-price-hint');
  if(!badge) return;
  // Show the hint only when editing makes sense (multi-session AND not locked)
  const locked = document.getElementById('p-price').readOnly;
  if(hint) hint.style.display = (total>=2 && !locked) ? '' : 'none';
  // Figure out the "list price" we're comparing against
  const listTotal = (listPps>0 ? listPps : pps) * total;
  if(total>=2 && price>0 && listTotal>0 && price < listTotal - 0.01){
    const disc = listTotal - price;
    const pct = (disc/listTotal*100).toFixed(1);
    badge.innerHTML = `💰 <b>Discount applied</b> — ${money(disc)} off (${pct}% off the ${money(listTotal)} list price). Effective rate: ${money(price/total)} / session.`;
    badge.style.display = 'block';
  } else if(total>=2 && price>0 && listTotal>0 && price > listTotal + 0.01){
    // Premium — rare but possible
    const premium = price - listTotal;
    badge.innerHTML = `ℹ️ Total is ${money(premium)} above the list price (${money(listTotal)}). Effective rate: ${money(price/total)} / session.`;
    badge.style.background = 'var(--blue-ghost)';
    badge.style.borderLeftColor = 'var(--blue-light)';
    badge.style.color = 'var(--blue)';
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}
// Legacy alias so older code paths still work
function recalcTotal(){ onPpsEdited(); }
function updatePaidPreview(){
  const total = +document.getElementById('p-total').value||0;
  const pps = +document.getElementById('p-pps').value||0;
  const price = +document.getElementById('p-price').value||0;
  const down = +document.getElementById('p-down').value||0;
  // If editing an existing package, include existing payments (minus old auto-recorded downpayment we're replacing)
  const id = document.getElementById('pkg-id').value;
  let existingPaid = 0;
  if(id){
    const p = DB.packages.find(x=>x.id==id);
    if(p){
      // Sum all non-"Initial downpayment (auto-recorded)" payments so we don't double-count
      // the downpayment that savePkg would re-record on edit.
      existingPaid = (p.payments||[]).reduce((s,pay)=>s+(+pay.amount||0), 0);
    }
  }
  const totalPaid = existingPaid>0 ? existingPaid : down;
  let paid;
  if(price<=0 || pps<=0){ paid = total; }
  else { paid = Math.min(total, Math.max(0, Math.floor(totalPaid/pps))); }
  const el = document.getElementById('p-paid');
  if(el) el.value = (price<=0||pps<=0) ? (paid+' (free — maxed)') : (paid+' / '+total);
}

// -------- Inventory supply deduction helpers --------
// List all distinct inventory item names across every branch (used in supply picker).
function allInventoryNames(){
  const seen = new Set();
  DB.inventory.forEach(i=>seen.add(i.name));
  return Array.from(seen).sort((a,b)=>a.localeCompare(b));
}
// Deduct (sign=+1) or restore (sign=-1) a set of supplies at a given branch.
// Returns an array of warning messages (never blocks the action — warns only).
function applyStockChange(branchId, supplies, sign){
  const warnings = [];
  (supplies||[]).forEach(s=>{
    const inv = DB.inventory.find(i=>branchMatches(i.branch, branchId) && i.name===s.itemName);
    if(!inv){
      warnings.push(`• "${s.itemName}" not found in ${branchName(branchId)} inventory — please add it so stock can be tracked.`);
      return;
    }
    const before = inv.qty||0;
    inv.qty = before - sign*(+s.qty||0);
    if(sign>0){
      if(inv.qty < 0){
        warnings.push(`⚠ ${s.itemName}: went below zero (${inv.qty}). Restock as soon as possible.`);
      } else if(inv.qty <= (inv.reorder||0)){
        warnings.push(`⚠ ${s.itemName}: low stock — ${inv.qty} ${inv.unit||''} remaining (reorder at ${inv.reorder}).`);
      }
    }
  });
  return warnings;
}
// Take a snapshot copy of a treatment's supplies so a logged session
// can be reversed cleanly even if the treatment's supplies are later edited.
function snapshotTreatmentSupplies(treatmentId){
  const t = DB.treatments.find(x=>x.id===treatmentId);
  if(!t || !Array.isArray(t.supplies)) return [];
  return t.supplies.map(s=>({itemName:s.itemName, qty:+s.qty||0}));
}

// -------- Packages --------
let currentPkgId = null; // for view modal / edit chaining

function pkgStats(pkg){
  const sessionsUsed = (pkg.sessions||[]).length;
  const sessionsRemaining = Math.max(0, pkg.totalSessions - sessionsUsed);
  const totalPaid = (pkg.payments||[]).reduce((s,p)=>s+(+p.amount||0), 0);
  const balance = Math.max(0, (pkg.totalPrice||0) - totalPaid);
  const sessionsPaid = computeSessionsPaid(pkg, totalPaid);
  return { sessionsUsed, sessionsRemaining, totalPaid, balance, sessionsPaid };
}

// Auto-compute the number of sessions paid based on total payments / price per session.
// If the package is free (no total price or no price per session), all sessions are considered paid.
function computeSessionsPaid(pkg, totalPaidOverride){
  const totalPaid = (totalPaidOverride!=null)
    ? totalPaidOverride
    : (pkg.payments||[]).reduce((s,p)=>s+(+p.amount||0), 0);
  const total = +pkg.totalSessions || 0;
  const pps = +pkg.pricePerSession || 0;
  const price = +pkg.totalPrice || 0;
  // Free package → all sessions are paid (maxed out)
  if(price<=0 || pps<=0) return total;
  const paid = Math.floor(totalPaid / pps);
  return Math.min(total, Math.max(0, paid));
}

// Refresh the cached sessionsPaid on a package (used after any payment change)
function refreshPkgSessionsPaid(pkg){
  if(!pkg) return;
  pkg.sessionsPaid = computeSessionsPaid(pkg);
}

function money(n){ return '₱' + Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2, maximumFractionDigits:2}); }

function renderPackages(){
  const br = DB.session.branch;
  document.getElementById('pkg-branch-name').textContent = branchName(br);
  const q = (document.getElementById('pkg-search')?.value||'').toLowerCase();
  const filter = document.getElementById('pkg-filter')?.value||'Active';
  let list = DB.packages.filter(p=>branchMatches(p.branch, br));
  if(filter!=='all') list = list.filter(p=>p.status===filter);
  if(q) list = list.filter(p=>{
    const c = DB.clients.find(x=>x.id===p.clientId);
    const name = c ? c.fname+' '+c.lname : '';
    return (name+' '+p.packageName).toLowerCase().includes(q);
  });
  const el = document.getElementById('pkg-list');
  if(!list.length){ el.innerHTML = '<div class="empty">No packages found. Click "+ New Package" to add one.</div>'; return; }
  const cards = list.map(p=>{
    const c = DB.clients.find(x=>x.id===p.clientId);
    const s = pkgStats(p);
    const pct = p.totalSessions ? Math.round(s.sessionsUsed/p.totalSessions*100) : 0;
    const pctPaid = p.totalPrice ? Math.round(s.totalPaid/p.totalPrice*100) : 0;
    const statusPill = p.status==='Active' ? '<span class="pill info">Active</span>' : p.status==='Completed' ? '<span class="pill ok">Completed</span>' : '<span class="pill bad">Cancelled</span>';
    return `<div class="pkg-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div>
          <h4>${esc(p.packageName)}</h4>
          <div class="client">${c?esc(c.fname+' '+c.lname):'— unknown client —'}</div>
        </div>
        ${statusPill}
      </div>
      <div class="pkg-stats">
        <div>Sessions used: <b>${s.sessionsUsed} / ${p.totalSessions}</b></div>
        <div>Sessions paid: <b>${s.sessionsPaid} / ${p.totalSessions}</b>${p.totalPrice>0?'':' <span class="pill gold" style="margin-left:4px">FREE</span>'}</div>
        <div>Remaining: <b>${s.sessionsRemaining}</b></div>
        <div>Downpayment: <b class="money">${money(p.downpayment)}</b></div>
        <div>Total price: <b class="money">${money(p.totalPrice)}</b></div>
        <div>Total paid: <b class="money">${money(s.totalPaid)}</b></div>
        <div style="grid-column:span 2">Balance: <b class="money" style="color:${s.balance>0?'var(--danger)':'var(--success)'}">${money(s.balance)}</b></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--muted)">Sessions progress (${pct}%)</div>
        <div class="progress"><div class="progress-bar ${pct>=100?'full':''}" style="width:${pct}%"></div></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--muted)">Payment progress (${pctPaid}%)</div>
        <div class="progress"><div class="progress-bar ${pctPaid>=100?'full':''}" style="width:${pctPaid}%"></div></div>
      </div>
      <div class="pkg-actions">
        <button class="btn small" onclick="viewPkg(${p.id})">View / Manage</button>
        <button class="btn small secondary" onclick="openSessionModal(${p.id})">+ Log Session</button>
        <button class="btn small secondary" onclick="openPaymentModal(${p.id})">+ Add Payment</button>
      </div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="pkg-grid">${cards}</div>`;
}

function openPkgModal(id, prefillClientId){
  fillClientSelect('p-client');
  fillTreatmentSelect();
  document.getElementById('pkg-delete-btn').style.display = id ? 'inline-block' : 'none';
  document.getElementById('p-branch').value = branchName(DB.session.branch);
  const lockedNote = document.getElementById('p-locked-note');
  if(id){
    const p = DB.packages.find(x => String(x.id) === String(id));
    if(!p){ alert('Package not found.'); return; }
    document.getElementById('pkg-modal-title').textContent = 'Edit Package';
    document.getElementById('pkg-id').value = p.id;
    document.getElementById('p-client').value = p.clientId;
    fillTreatmentSelect(p.treatmentId);
    document.getElementById('p-total').value = p.totalSessions||1;
    document.getElementById('p-pps').value = p.pricePerSession||0;
    document.getElementById('p-price').value = p.totalPrice||0;
    document.getElementById('p-down').value = p.downpayment||0;
    document.getElementById('p-gap').value = p.daysBetween||14;
    document.getElementById('p-start').value = p.dateStarted||todayStr();
    document.getElementById('p-status').value = p.status||'Active';
    document.getElementById('p-notes').value = p.notes||'';
    // Preserve the service's original list price so the discount badge can show savings
    const tOrig = DB.treatments.find(x=>x.id===p.treatmentId);
    document.getElementById('p-price').dataset.listPps = String(tOrig ? tOrig.pricePerSession : p.pricePerSession||0);
    // Mark as "user edited" if saved total doesn't match sessions × original list pps
    const expectedList = (tOrig?tOrig.pricePerSession:p.pricePerSession||0) * (p.totalSessions||1);
    document.getElementById('p-price').dataset.userEdited = (Math.abs((p.totalPrice||0) - expectedList) > 0.01) ? '1' : '0';
    // Lock pricing fields if priceLocked
    const locked = !!p.priceLocked;
    lockedNote.style.display = locked ? 'block' : 'none';
    ['p-pps','p-price','p-down','p-total','p-gap','p-treatment'].forEach(el=>{
      document.getElementById(el).readOnly = locked;
      if(locked) document.getElementById(el).style.background = 'var(--gold-soft)';
      else document.getElementById(el).style.background = '';
    });
    // Select stays non-readOnly; disable it instead
    document.getElementById('p-treatment').disabled = locked;
  } else {
    document.getElementById('pkg-modal-title').textContent = 'New Package';
    document.getElementById('pkg-id').value = '';
    if(prefillClientId) document.getElementById('p-client').value = prefillClientId;
    document.getElementById('p-total').value = 6;
    document.getElementById('p-pps').value = 0;
    document.getElementById('p-price').value = 0;
    document.getElementById('p-down').value = 0;
    document.getElementById('p-gap').value = 14;
    document.getElementById('p-start').value = todayStr();
    document.getElementById('p-status').value = 'Active';
    document.getElementById('p-notes').value = '';
    // Reset discount-tracking state
    document.getElementById('p-price').dataset.listPps = '0';
    document.getElementById('p-price').dataset.userEdited = '0';
    lockedNote.style.display = 'none';
    ['p-pps','p-price','p-down','p-total','p-gap','p-treatment'].forEach(el=>{
      document.getElementById(el).readOnly = false;
      document.getElementById(el).style.background = '';
    });
    document.getElementById('p-treatment').disabled = false;
  }
  // "Record to today's sales" checkbox — hidden on edit (only applies at
  // creation time), reset to unchecked on every open so it never silently
  // carries over from a previous new-package session.
  const toSales = document.getElementById('p-to-sales');
  if(toSales){
    toSales.checked = false;
    const row = toSales.closest('.form-row');
    if(row) row.style.display = id ? 'none' : '';
  }
  updateDiscountBadge();
  updatePaidPreview();
  openModal('pkg-modal');
}

function savePkg(){
  const id = document.getElementById('pkg-id').value;
  const clientId = +document.getElementById('p-client').value;
  const treatmentId = +document.getElementById('p-treatment').value;
  const total = +document.getElementById('p-total').value||0;
  if(!clientId || !treatmentId || total<1){ alert('Client, treatment and total sessions are required'); return; }
  const branch = DB.session.branch;
  const dupPkg = findDuplicatePackage(clientId, treatmentId, branch, id);
  if(dupPkg){
    alert('This package already exists for the same client in the current branch.');
    return;
  }
  const t = DB.treatments.find(x=>x.id===treatmentId);
  const downpayment = +document.getElementById('p-down').value||0;
  const rec = {
    clientId,
    branch,
    treatmentId,
    packageName: t ? t.name : '(unknown)',
    totalSessions: total,
    pricePerSession: +document.getElementById('p-pps').value||0,
    totalPrice: +document.getElementById('p-price').value||0,
    downpayment,
    daysBetween: +document.getElementById('p-gap').value||(t?t.daysBetween:14),
    dateStarted: document.getElementById('p-start').value||todayStr(),
    status: document.getElementById('p-status').value,
    notes: document.getElementById('p-notes').value
  };
  if(id){
    // String-match so Firestore-string ids also find their row.
    const idx = DB.packages.findIndex(x => String(x.id) === String(id));
    if(idx < 0){ alert('Package not found.'); return; }
    // Preserve priceLocked and existing sub-records (including .payments and
    // .sessions — DO NOT overwrite them by spreading rec on top, since rec
    // doesn't include them).
    rec.priceLocked = DB.packages[idx].priceLocked || downpayment>0;
    const merged = {...DB.packages[idx], ...rec};
    DB.packages[idx] = merged;
    // Auto-recompute sessionsPaid based on existing payments + current price
    refreshPkgSessionsPaid(merged);
    // Sync to Firestore — write the FULL merged object, not just `rec`. `rec`
    // is missing payments/sessions, and our set({merge:true}) would leave
    // those untouched on the server — but we should still push the full
    // shape for consistency with the snapshot that will come back.
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.update('packages', String(merged.id), merged).catch(err => console.error("Firestore update error:", err));
    }
  } else {
    rec.id = nextId('pkg');
    rec.sessions = [];
    rec.payments = [];
    rec.priceLocked = false;
    // Only create the downpayment payment record — and therefore make this
    // package show up on today's Sales page — if the user explicitly ticked
    // "Record downpayment to today's sales" on the package form. This is a
    // behavior change from earlier builds, where entering any downpayment
    // amount automatically created a sale entry. Per user request: creating
    // a package should NOT silently land on the day's sales; that stays an
    // opt-in, either via this checkbox at creation time or via the
    // "Add Payment" flow in the package's detail view afterward.
    const recordToSales = !!document.getElementById('p-to-sales')?.checked;
    if(recordToSales && downpayment>0){
      rec.payments.push({
        id: nextId('payment'),
        date: rec.dateStarted,
        amount: downpayment,
        type: 'Downpayment',
        method: 'Cash',
        ref: '',
        notes: 'Initial downpayment (recorded to today\u2019s sales at package creation)'
      });
      rec.priceLocked = true;
    }
    // Compute initial sessionsPaid (from downpayment / pps, or maxed for free)
    refreshPkgSessionsPaid(rec);
    DB.packages.push(rec);
    // Sync to Firestore if available
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
      window.FirestoreCRUD.add('packages', rec).catch(err => console.error("Firestore add error:", err));
    }
  }
  saveData();
  closeModal('pkg-modal');
  renderPackages();
  renderDashboard();
  renderUpcoming();
  updateUpcomingBadge();
}

function deletePkg(){
  // Use raw string — numeric coercion would become NaN for Firestore-assigned
  // string ids and the filter would silently keep the row.
  const raw = document.getElementById('pkg-id').value;
  if(!raw){ alert('No package selected.'); return; }
  const id = String(raw);
  if(!confirm('Delete this package? All session and payment records for it will be lost.')) return;
  DB.packages = DB.packages.filter(x => String(x.id) !== id);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.delete('packages', id).catch(err => console.error("Firestore delete error:", err));
  }
  saveData();
  closeModal('pkg-modal');
  renderPackages();
  renderDashboard();
}

function viewPkg(id){
  // String-tolerant lookup — some pkg.ids are strings after Firestore hydration.
  const p = DB.packages.find(x => String(x.id) === String(id));
  if(!p){ alert('Package not found. It may have just been deleted — refresh the page.'); return; }
  currentPkgId = p.id;
  const c = DB.clients.find(x => String(x.id) === String(p.clientId));
  const s = pkgStats(p);
  const sessionRows = (p.sessions||[]).length
    ? p.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((ss,i)=>`<tr>
        <td>#${p.sessions.length - i}</td>
        <td>${fmtDate(ss.date)} ${ss.time?fmtTime(ss.time):''}</td>
        <td>${esc(ss.therapist||'')}</td>
        <td>${esc(ss.notes||'')}</td>
        <td>${ss.apptId?'<span class="pill info">from appt</span>':''}<button class="btn small danger" onclick="removeSession(${p.id},${ss.id})">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--muted)">No sessions logged yet</td></tr>';
  const payRows = (p.payments||[]).length
    ? p.payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(pp=>`<tr>
        <td>${fmtDate(pp.date)}</td>
        <td><span class="pill ${pp.type==='Downpayment'?'ok':'info'}">${esc(pp.type)}</span></td>
        <td>${esc(pp.method||'')}</td>
        <td class="money">${money(pp.amount)}</td>
        <td>${esc(pp.ref||'')}${pp.notes?' — '+esc(pp.notes):''}</td>
        <td><button class="btn small danger" onclick="removePayment(${p.id},${pp.id})">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--muted)">No payments recorded</td></tr>';

  document.getElementById('pkg-view-title').textContent = p.packageName;
  document.getElementById('pkg-view-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;font-size:13px">
      <div><b>Client:</b> ${c?esc(c.fname+' '+c.lname):'—'}</div>
      <div><b>Branch:</b> ${esc(branchName(p.branch))}</div>
      <div><b>Date started:</b> ${fmtDate(p.dateStarted)}</div>
      <div><b>Status:</b> ${esc(p.status)}</div>
      <div><b>Total sessions:</b> ${p.totalSessions}</div>
      <div><b>Sessions used:</b> ${s.sessionsUsed}</div>
      <div><b>Sessions remaining:</b> ${s.sessionsRemaining}</div>
      <div><b>Sessions paid:</b> ${s.sessionsPaid} / ${p.totalSessions}${p.totalPrice>0?` <span style="color:var(--muted);font-size:11px">(${money(s.totalPaid)} ÷ ${money(p.pricePerSession)})</span>`:' <span class="pill gold" style="margin-left:4px">FREE — maxed</span>'}</div>
      <div><b>Price / session:</b> <span class="money">${money(p.pricePerSession)}</span></div>
      <div><b>Total price:</b> <span class="money">${money(p.totalPrice)}</span></div>
      <div><b>Downpayment:</b> <span class="money">${money(p.downpayment)}</span></div>
      <div><b>Total paid:</b> <span class="money">${money(s.totalPaid)}</span></div>
      <div style="grid-column:span 2"><b>Balance:</b> <span class="money" style="color:${s.balance>0?'var(--danger)':'var(--success)'};font-size:16px">${money(s.balance)}</span></div>
    </div>
    ${p.notes?`<div style="background:var(--blue-ghost);border:1px solid var(--border-blue);border-left:3px solid var(--blue-light);padding:10px;border-radius:6px;margin-bottom:14px;font-size:13px"><b>Notes:</b> ${esc(p.notes)}</div>`:''}

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <h4 style="margin:0">Sessions</h4>
      <div style="display:flex;gap:6px">
        <button class="btn small secondary" onclick="adjustSessionsUsed(${p.id})" title="For packages that started before this system: set the sessions-used count directly.">⚙ Set sessions used</button>
        <button class="btn small" onclick="openSessionModal(${p.id})">+ Log Session</button>
      </div>
    </div>
    <table style="margin-bottom:18px"><thead><tr><th>#</th><th>When</th><th>Therapist</th><th>Notes</th><th></th></tr></thead><tbody>${sessionRows}</tbody></table>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <h4 style="margin:0">Payments</h4>
      <button class="btn small" onclick="openPaymentModal(${p.id})">+ Add Payment</button>
    </div>
    <table><thead><tr><th>Date</th><th>Type</th><th>Method</th><th>Amount</th><th>Ref / Notes</th><th></th></tr></thead><tbody>${payRows}</tbody></table>
  `;
  openModal('pkg-view-modal');
}

function editCurrentPkg(){
  if(!currentPkgId) return;
  closeModal('pkg-view-modal');
  openPkgModal(currentPkgId);
}

function openSessionModal(pkgId){
  document.getElementById('s-pkg-id').value = pkgId;
  document.getElementById('s-date').value = todayStr();
  document.getElementById('s-time').value = new Date().toTimeString().slice(0,5);
  document.getElementById('s-therapist').value = '';
  document.getElementById('s-notes').value = '';
  openModal('session-modal');
}

function saveSession(){
  const pkgIdRaw = document.getElementById('s-pkg-id').value;
  const pkgId = +pkgIdRaw;
  const p = DB.packages.find(x=>String(x.id)===String(pkgIdRaw));
  if(!p) return;
  const s = pkgStats(p);
  if(s.sessionsUsed >= p.totalSessions){
    if(!confirm('This package already has all sessions used. Log this one anyway (over-limit)?')) return;
  }
  p.sessions = p.sessions||[];
  // Snapshot supplies from the treatment so inventory can be reversed accurately
  const supplies = snapshotTreatmentSupplies(p.treatmentId);
  const warnings = applyStockChange(p.branch, supplies, +1);
  p.sessions.push({
    id: nextId('session'),
    date: document.getElementById('s-date').value||todayStr(),
    time: document.getElementById('s-time').value||'',
    therapist: document.getElementById('s-therapist').value.trim(),
    notes: document.getElementById('s-notes').value,
    apptId: null,
    supplies  // snapshot stored on the session itself
  });
  // Auto-complete package when all sessions used
  if((p.sessions.length>=p.totalSessions) && p.status==='Active'){ p.status='Completed'; }
  // Sync the mutated package to Firestore. Without this, the next snapshot
  // (from ANY device's write, or from this package's own listener re-firing)
  // replaces `p` with the Firestore copy that doesn't know about this new
  // session — which is why sessionsUsed was visually "resetting to 0
  // everytime it updates".
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('packages', String(p.id), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  closeModal('session-modal');
  renderPackages();
  renderInventory && renderInventory();
  renderDashboard();
  if(document.getElementById('pkg-view-modal').classList.contains('active') || currentPkgId===pkgId){ viewPkg(pkgId); }
  if(warnings.length) alert('Session logged and supplies deducted.\n\n'+warnings.join('\n'));
}

// Manually set the "sessions used" count for a package. Intended for
// importing packages that were started on paper/another system — the user
// just wants to say "this client has already used 5 out of 10," without
// backfilling individual session records and without touching inventory.
// Implementation: pad or trim a placeholder list of sessions (tagged
// {imported:true, supplies:[]} so inventory is NOT deducted) until the
// total count matches the requested value.
function adjustSessionsUsed(pkgId){
  const p = DB.packages.find(x=>String(x.id)===String(pkgId));
  if(!p){ alert('Package not found.'); return; }
  p.sessions = p.sessions || [];
  const current = p.sessions.length;
  const raw = prompt(
    `Set sessions used for "${p.packageName}".\n\n` +
    `Currently: ${current} / ${p.totalSessions}\n\n` +
    `Enter the new sessions-used count (0–${p.totalSessions}).\n` +
    `Existing real session records will be preserved; only placeholder\n` +
    `"imported" entries are added or removed. No inventory is deducted.`,
    String(current)
  );
  if(raw==null) return; // user cancelled
  const target = Math.max(0, Math.min(+raw, p.totalSessions));
  if(!Number.isFinite(target)){ alert('Not a valid number.'); return; }
  if(target === current) return;
  if(target > current){
    const toAdd = target - current;
    for(let i=0;i<toAdd;i++){
      p.sessions.push({
        id: nextId('session'),
        date: todayStr(),
        time: '',
        therapist: '',
        notes: 'Imported (pre-system record)',
        apptId: null,
        supplies: [],
        imported: true
      });
    }
  } else {
    // Prefer removing imported placeholders first, then fall back to the
    // most-recent real sessions if the user is really trying to trim.
    const toRemove = current - target;
    let removed = 0;
    // Pass 1: drop imported placeholders from the end
    for(let i=p.sessions.length-1; i>=0 && removed<toRemove; i--){
      if(p.sessions[i].imported){ p.sessions.splice(i,1); removed++; }
    }
    // Pass 2: if still more to remove, warn and drop real ones from the end
    if(removed < toRemove){
      const extra = toRemove - removed;
      if(!confirm(`Only ${removed} imported placeholder(s) could be removed. To hit ${target}, ${extra} real session record(s) will also be deleted. Continue?`)){
        // revert the imported-placeholder removals? Easiest: leave as-is; user just said cancel so don't trim further
        renderPackages();
        viewPkg(pkgId);
        return;
      }
      for(let i=p.sessions.length-1; i>=0 && removed<toRemove; i--){
        p.sessions.splice(i,1); removed++;
      }
    }
  }
  // Status follow-through: if it was Completed and now isn't full, re-open it.
  if(p.status==='Completed' && p.sessions.length < p.totalSessions) p.status='Active';
  if(p.status==='Active' && p.sessions.length >= p.totalSessions) p.status='Completed';
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
    window.FirestoreCRUD.update('packages', String(p.id), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  renderPackages();
  renderDashboard();
  viewPkg(pkgId);
}

function removeSession(pkgId, sessionId){
  if(!confirm('Remove this session from the package? Any inventory deducted for it will be restored.')) return;
  // String-match so the call works for both numeric-id (local) and
  // string-id (Firestore-rehydrated) packages.
  const p = DB.packages.find(x => String(x.id) === String(pkgId));
  if(!p){ alert('Package not found.'); return; }
  const removed = (p.sessions||[]).find(s => String(s.id) === String(sessionId));
  if(removed){
    // Restore supplies if we have a snapshot; fall back to the treatment's current supplies
    const toRestore = Array.isArray(removed.supplies) && removed.supplies.length
      ? removed.supplies
      : snapshotTreatmentSupplies(p.treatmentId);
    applyStockChange(p.branch, toRestore, -1);
  }
  p.sessions = (p.sessions||[]).filter(s => String(s.id) !== String(sessionId));
  if(p.status==='Completed' && p.sessions.length<p.totalSessions) p.status='Active';
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('packages', String(p.id), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  viewPkg(p.id);
  renderPackages();
  renderInventory && renderInventory();
  renderDashboard();
}

// Card surcharge rate — bank charges 4% of the swiped amount by default.
const CARD_SURCHARGE_RATE = 0.04;

function isCardMethod(m){ return (m||'').toLowerCase().includes('card'); }
// Compute surcharge on a payment row. Honors the per-row waived flag.
function computeSurcharge(amount, method, waived){
  if(!isCardMethod(method) || waived) return 0;
  return +((+amount||0) * CARD_SURCHARGE_RATE).toFixed(2);
}

function recalcPaySurcharge(){
  const amt = +document.getElementById('pay-amount').value||0;
  const method = document.getElementById('pay-method').value;
  const waived = document.getElementById('pay-waive').checked;
  const block = document.getElementById('pay-card-block');
  if(!isCardMethod(method)){
    block.style.display = 'none';
    return;
  }
  block.style.display = 'block';
  const surcharge = computeSurcharge(amt, method, waived);
  const clientPays = (+amt||0) + surcharge;
  const msg = waived
    ? `<span style="color:var(--success)"><b>Waived.</b></span> Client pays <b>${money(amt)}</b>. (Clinic absorbs the ${CARD_SURCHARGE_RATE*100}% bank fee.)`
    : `Surcharge: <b>${money(surcharge)}</b> &nbsp; · &nbsp; Client pays total: <b>${money(clientPays)}</b> &nbsp; · &nbsp; Credited to balance: <b>${money(amt)}</b>`;
  document.getElementById('pay-surcharge-calc').innerHTML = msg;
}

function openPaymentModal(pkgId){
  document.getElementById('pay-pkg-id').value = pkgId;
  document.getElementById('pay-date').value = todayStr();
  document.getElementById('pay-amount').value = '';
  document.getElementById('pay-type').value = 'Additional';
  document.getElementById('pay-method').value = 'Cash';
  document.getElementById('pay-waive').checked = false;
  document.getElementById('pay-ref').value = '';
  document.getElementById('pay-notes').value = '';
  recalcPaySurcharge();
  openModal('payment-modal');
}

function savePayment(){
  // ⚠ Don't numeric-coerce pkgId. Some packages already have string ids in
  // DB.packages (pushed there by firestore-layer rounds past), and `+"8"` +
  // strict `===` would miss them. Root cause of "newer packages don't reflect
  // the payment" in round 5. Use the raw string and String-match the lookup.
  const pkgIdRaw = document.getElementById('pay-pkg-id').value;
  const amount = +document.getElementById('pay-amount').value;
  if(!amount || amount<=0){ alert('Enter a valid amount'); return; }
  const p = DB.packages.find(x => String(x.id) === String(pkgIdRaw));
  if(!p){ alert('Package not found. Close this dialog and try again.'); return; }
  const pkgId = p.id; // preserve the matched package's real id (string or number)
  const method = document.getElementById('pay-method').value;
  const waived = document.getElementById('pay-waive').checked;
  const surcharge = computeSurcharge(amount, method, waived);
  p.payments = p.payments||[];
  p.payments.push({
    id: nextId('payment'),
    date: document.getElementById('pay-date').value||todayStr(),
    amount,             // credited toward balance
    surcharge,          // extra collected from client (passthrough to bank)
    surchargeWaived: !!waived,
    type: document.getElementById('pay-type').value,
    method,
    ref: document.getElementById('pay-ref').value.trim(),
    notes: document.getElementById('pay-notes').value,
    branch: p.branch    // denormalize so sales report can filter without re-lookup
  });
  // Lock price snapshot once any payment is recorded
  p.priceLocked = true;
  // Re-derive sessions paid so it reflects the new total payments
  refreshPkgSessionsPaid(p);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('packages', String(pkgId), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  closeModal('payment-modal');
  renderPackages();
  renderDashboard();
  if(String(currentPkgId)===String(pkgId)){ viewPkg(pkgId); }
}

// -------- Add Payment (walk-in / comeback / one-off) --------
// User-facing: the "+ Add Payment" button on the Sales page, next to
// "+ Add Expense". Captures a client (auto-adds to Client list if new) and
// records a payment for today. Treatment and/or Product — at least one.
// Stored as a row in DB.purchases with type:'service' so it rides the
// existing `purchases` Firestore listener without needing a new collection
// or listener in firestore-layer.js. collectDayPayments tags these as
// kind:'walkin' for badge rendering in Sales.

// Round-4 rework: the Add Payment modal now has TWO modes, Existing vs New.
// These two module-level variables track the current mode and the selected
// existing client (if any).
let currentWalkinMode = 'existing';
let selectedWalkinClientId = null;

function openWalkinModal(){
  console.log('[Awe-Ra] openWalkinModal called');
  try {
    const backdrop = document.getElementById('walkin-modal');
    if(!backdrop){
      console.error('[Awe-Ra] #walkin-modal not found in DOM. The deployed index.html is stale.');
      alert('The "Add Payment" modal is missing from this page.\n\n' +
            'Hard-refresh (Ctrl-Shift-R / Cmd-Shift-R). If that fails, redeploy index.html.');
      return;
    }
    if(typeof openModal !== 'function'){
      alert('Internal error: openModal helper is missing. Hard-refresh the page.');
      return;
    }
    // Default to Existing Client tab
    selectedWalkinClientId = null;
    // Clear new-client fields (in case user toggles to New tab)
    ['w-fname','w-lname','w-phone','w-address','w-product','w-notes'].forEach(i=>{
      const el = document.getElementById(i); if(el) el.value = '';
    });
    const priceEl = document.getElementById('w-price'); if(priceEl) priceEl.value = 0;
    const methodEl = document.getElementById('w-method'); if(methodEl) methodEl.value = 'Cash';
    // Clear existing-client state
    const srch = document.getElementById('walkin-search'); if(srch) srch.value = '';
    const results = document.getElementById('walkin-search-results'); if(results) results.innerHTML = '';
    const selPanel = document.getElementById('walkin-selected-client'); if(selPanel) selPanel.style.display = 'none';

    switchWalkinTab('existing');
    openModal('walkin-modal');
    console.log('[Awe-Ra] openWalkinModal: opened ok');
  } catch (e) {
    console.error('[Awe-Ra] openWalkinModal failed:', e);
    alert('Could not open the Add Payment modal: ' + (e && e.message || e));
  }
}
window.openWalkinModal = openWalkinModal;

// Switch between the Existing-Client and New-Client tabs.
function switchWalkinTab(mode){
  try {
    const exEl = document.getElementById('walkin-existing-section');
    const newEl = document.getElementById('walkin-new-section');
    const exBtn = document.getElementById('walkin-tab-existing');
    const newBtn = document.getElementById('walkin-tab-new');
    if(!exEl || !newEl){ console.error('walkin tab sections missing'); return; }
    currentWalkinMode = (mode === 'new') ? 'new' : 'existing';
    if(currentWalkinMode === 'new'){
      newEl.style.display = '';
      exEl.style.display = 'none';
      if(newBtn) newBtn.classList.remove('secondary');
      if(exBtn) exBtn.classList.add('secondary');
      populateWalkinServiceDropdown('w-service');
    } else {
      exEl.style.display = '';
      newEl.style.display = 'none';
      if(exBtn) exBtn.classList.remove('secondary');
      if(newBtn) newBtn.classList.add('secondary');
      populateWalkinServiceDropdown('walkin-oneoff-svc');
    }
  } catch(e){
    console.error('switchWalkinTab failed:', e);
  }
}
window.switchWalkinTab = switchWalkinTab;

// Populate a <select> (by id) with the services catalog. Used by both tabs.
function populateWalkinServiceDropdown(selectId){
  const sel = document.getElementById(selectId);
  if(!sel) return;
  const list = (window.DB && Array.isArray(DB.treatments)) ? DB.treatments.slice() : [];
  list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  sel.innerHTML = '<option value="">— none —</option>' +
    list.map(t =>
      `<option value="${String(t.id)}" data-price="${+t.pricePerSession||0}">${esc(t.name)} (${money(+t.pricePerSession||0)})</option>`
    ).join('');
  sel.value = '';
}

// ---- Existing-client search ----
// Filters DB.clients by name/phone. Cross-branch (round 4) — no branch
// filter applied. Shows up to ~12 results.
function searchWalkinClients(){
  const q = (document.getElementById('walkin-search').value||'').trim().toLowerCase();
  const out = document.getElementById('walkin-search-results');
  if(!out) return;
  // When the search is empty OR the search box currently holds the
  // "Lname, Fname" we auto-filled after selection, don't re-render results.
  if(!q){ out.innerHTML = ''; return; }
  const matches = (DB.clients||[]).filter(c => {
    const hay = (c.fname+' '+c.lname+' '+(c.phone||'')+' '+(c.address||'')).toLowerCase();
    return hay.includes(q);
  }).slice(0, 12);
  if(!matches.length){
    out.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:12px;background:var(--blue-ghost);border-radius:4px">No matching clients. Switch to the <b>New Client</b> tab to register a new one.</div>';
    // Hide selected panel if we had one loaded previously
    const panel = document.getElementById('walkin-selected-client');
    if(panel) panel.style.display = 'none';
    selectedWalkinClientId = null;
    return;
  }
  out.innerHTML = matches.map(c => {
    return `<div style="cursor:pointer;padding:8px 10px;border:1px solid var(--border-blue);border-radius:4px;margin-bottom:4px;background:#fff" onclick="selectWalkinClient(${idArg(c.id)})" onmouseover="this.style.background='var(--blue-ghost)'" onmouseout="this.style.background='#fff'">
      <div style="font-weight:600">${esc(c.lname)}, ${esc(c.fname)}</div>
      <div style="font-size:11px;color:var(--muted)">${esc(c.phone||'no phone')} · ${esc(branchName(c.homeBranch))} · ${esc(c.address||'no address')}</div>
    </div>`;
  }).join('');
}
window.searchWalkinClients = searchWalkinClients;

// Loads the picked client's info + active packages into the inline panel.
function selectWalkinClient(clientId){
  // Per user request (round 5): clicking a search result should jump
  // straight to the same View Client window shown from the Clients tab,
  // so reception can pick the specific package and hit its "+ Add Payment"
  // button. That view already handles the full payment workflow (session
  // logging, split payments, product purchases) — much cleaner than the
  // in-modal mini-forms we had before. The mini-forms remain in the HTML
  // as fallback, but this path supersedes them.
  try {
    const id = String(clientId);
    const c = (DB.clients||[]).find(x => String(x.id) === id);
    if(!c){ alert('Client not found.'); return; }
    selectedWalkinClientId = c.id;
    closeModal('walkin-modal');
    // Small defer so the close animation finishes and focus doesn't
    // bounce between the two modals on Safari.
    setTimeout(() => {
      try {
        viewClient(c.id);
      } catch(e){
        console.error('viewClient from walk-in failed:', e);
        alert('Could not open client view: ' + (e && e.message || e));
      }
    }, 10);
  } catch(e){
    console.error('selectWalkinClient failed:', e);
    alert('Could not load that client: ' + (e && e.message || e));
  }
}
window.selectWalkinClient = selectWalkinClient;

// Show/hide the one-off fields when the user flips the Apply-To dropdown.
function onWalkinApplyToChange(){
  const v = document.getElementById('walkin-apply-to').value;
  const oneoffWrap = document.getElementById('walkin-oneoff-fields');
  if(v === 'oneoff'){
    if(oneoffWrap) oneoffWrap.style.display = '';
  } else {
    if(oneoffWrap) oneoffWrap.style.display = 'none';
  }
  updateWalkinSplitPreview();
}
window.onWalkinApplyToChange = onWalkinApplyToChange;

// When the user picks a service inside the Existing-Client one-off flow,
// pre-fill the Amount from the service's per-session price.
function onWalkinExistServiceChange(){
  const sel = document.getElementById('walkin-oneoff-svc');
  const priceEl = document.getElementById('walkin-exist-amount');
  if(!sel || !priceEl) return;
  const opt = sel.options[sel.selectedIndex];
  const price = opt ? +opt.getAttribute('data-price') || 0 : 0;
  if(price > 0) priceEl.value = price;
  updateWalkinSplitPreview();
}
window.onWalkinExistServiceChange = onWalkinExistServiceChange;

// Live preview of the split when the user picks a package + enters amount.
function updateWalkinSplitPreview(){
  const infoEl = document.getElementById('walkin-split-info');
  if(!infoEl) return;
  const v = document.getElementById('walkin-apply-to').value;
  if(v === 'oneoff'){ infoEl.style.display = 'none'; return; }
  const pkgId = v.replace(/^pkg:/, '');
  const pkg = (DB.packages||[]).find(p => String(p.id) === pkgId);
  if(!pkg){ infoEl.style.display = 'none'; return; }
  const amount = +document.getElementById('walkin-exist-amount').value || 0;
  const availed = (pkg.sessions||[]).length;
  const paid = computeSessionsPaid(pkg);
  const unpaidAvailed = Math.max(0, availed - paid);
  infoEl.style.display = '';
  if(amount <= 0){
    infoEl.innerHTML = '<b>Heads up:</b> enter an amount to see the per-session breakdown.';
    return;
  }
  if(unpaidAvailed === 0){
    infoEl.innerHTML = `<b>No unpaid availed sessions.</b> All ${availed} availed sessions are already paid. ${money(amount)} will be recorded as a single <b>Additional</b> payment dated today (applies toward package balance / future sessions).`;
    return;
  }
  const perSession = amount / unpaidAvailed;
  const sessionsSorted = (pkg.sessions||[]).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const unpaidSessions = sessionsSorted.slice(paid, paid + unpaidAvailed);
  const dates = unpaidSessions.map(s => s.date || '?').join(', ');
  infoEl.innerHTML =
    `<b>Split preview:</b> ${money(amount)} ÷ ${unpaidAvailed} unpaid availed session${unpaidAvailed===1?'':'s'} = <b>${money(perSession)} per session</b>.<br/>` +
    `${unpaidAvailed} payment record${unpaidAvailed===1?'':'s'} will be created, one per session, dated to: ${esc(dates)}.<br/>` +
    `<span style="color:#78350f">These will NOT appear on today's Sales page — they land on those past session dates. Pick <b>One-off service / product payment</b> instead if you want today's Sales to reflect this.</span>`;
}
window.updateWalkinSplitPreview = updateWalkinSplitPreview;

// Save dispatcher — called by the single "Save Payment" footer button.
function saveWalkinFromCurrentTab(){
  if(currentWalkinMode === 'new'){
    saveWalkin();
  } else {
    saveExistingWalkinPayment();
  }
}
window.saveWalkinFromCurrentTab = saveWalkinFromCurrentTab;

// Handle the Existing-Client Save. Two sub-flows:
//  • Apply-To = oneoff → single DB.purchases row (type:'service'), dated today.
//  • Apply-To = pkg:<id> → split evenly across the unpaid-availed sessions,
//    each payment dated to the matching session.date.
function saveExistingWalkinPayment(){
  try {
    const c = (DB.clients||[]).find(x => String(x.id) === String(selectedWalkinClientId));
    if(!c){ alert('No client selected. Search and click a client first.'); return; }
    const applyTo = document.getElementById('walkin-apply-to').value;
    const amount = +document.getElementById('walkin-exist-amount').value || 0;
    const method = document.getElementById('walkin-exist-method').value || 'Cash';
    const notes = document.getElementById('walkin-exist-notes').value || '';
    if(amount <= 0){ alert('Amount must be greater than 0.'); return; }

    if(applyTo === 'oneoff'){
      const svcId = (document.getElementById('walkin-oneoff-svc').value||'').trim();
      const product = (document.getElementById('walkin-oneoff-product').value||'').trim();
      if(!svcId && !product){
        alert('For a one-off payment, fill in either a Treatment or a Product.');
        return;
      }
      const svc = svcId ? (DB.treatments||[]).find(t => String(t.id) === String(svcId)) : null;
      const descParts = [];
      if(svc) descParts.push(svc.name);
      if(product) descParts.push('Product: ' + product);
      const description = descParts.join(' + ') || 'Walk-in payment';
      const rec = {
        id: nextId('purchase'),
        type: 'service',
        clientId: c.id,
        clientName: c.fname + ' ' + c.lname,
        branch: DB.session.branch,
        date: todayStr(),
        itemName: description,
        treatmentId: svc ? svc.id : null,
        productText: product,
        qty: 1,
        unitPrice: amount,
        total: amount,
        method,
        paid: true,
        surcharge: 0,
        surchargeWaived: false,
        ref: '',
        notes,
        createdAt: new Date().toISOString(),
        createdBy: (firebase.auth().currentUser && firebase.auth().currentUser.uid) || 'system'
      };
      DB.purchases = DB.purchases || [];
      DB.purchases.push(rec);
      if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
        window.FirestoreCRUD.add('purchases', rec).catch(err => console.error('Firestore purchase add error:', err));
      }
      saveData();
      closeModal('walkin-modal');
      if(currentPage === 'sales') renderSales();
      if(currentPage === 'clients') renderClients();
      if(currentPage === 'dashboard') renderDashboard();
      alert('One-off payment recorded for ' + c.fname + ' ' + c.lname + '.');
      return;
    }

    // Package payment flow
    const pkgId = applyTo.replace(/^pkg:/, '');
    const pkg = (DB.packages||[]).find(p => String(p.id) === pkgId);
    if(!pkg){ alert('Package not found. It may have been deleted — re-open the modal.'); return; }
    const availed = (pkg.sessions||[]).length;
    const paid = computeSessionsPaid(pkg);
    const unpaidAvailed = Math.max(0, availed - paid);

    pkg.payments = pkg.payments || [];
    let msg;
    if(unpaidAvailed === 0){
      // All availed sessions already paid → single "Additional" payment today.
      pkg.payments.push({
        id: nextId('payment'),
        date: todayStr(),
        amount,
        surcharge: 0,
        surchargeWaived: false,
        type: 'Additional',
        method,
        ref: '',
        notes: notes || 'Recorded via Sales › + Add Payment (no unpaid-availed sessions).',
        branch: DB.session.branch
      });
      msg = `${money(amount)} recorded as an Additional payment on ${pkg.packageName}.`;
    } else {
      // Split evenly across the N unpaid-availed sessions.
      const perSession = +(amount / unpaidAvailed).toFixed(2);
      const sessionsSorted = (pkg.sessions||[]).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      const unpaidSessions = sessionsSorted.slice(paid, paid + unpaidAvailed);
      unpaidSessions.forEach((s, idx) => {
        pkg.payments.push({
          id: nextId('payment'),
          date: s.date || todayStr(),
          amount: perSession,
          surcharge: 0,
          surchargeWaived: false,
          type: 'Session Payment',
          method,
          ref: '',
          notes: (notes ? notes + ' — ' : '') +
                 `Split ${idx+1}/${unpaidAvailed} of ${money(amount)} across availed sessions (recorded via Sales › + Add Payment on ${todayStr()})`,
          branch: DB.session.branch
        });
      });
      msg = `${money(amount)} split across ${unpaidAvailed} availed session${unpaidAvailed===1?'':'s'} (${money(perSession)} each) on ${pkg.packageName}. These payments are dated to the session dates, NOT today — today's Sales page won't show them.`;
    }

    refreshPkgSessionsPaid(pkg);
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
      window.FirestoreCRUD.update('packages', String(pkg.id), pkg).catch(err => console.error('Firestore pkg update error:', err));
    }
    saveData();
    closeModal('walkin-modal');
    if(currentPage === 'sales') renderSales();
    if(currentPage === 'packages') renderPackages();
    if(currentPage === 'dashboard') renderDashboard();
    alert(msg);
  } catch(e){
    console.error('saveExistingWalkinPayment failed:', e);
    alert('Could not save payment: ' + (e && e.message || e));
  }
}
window.saveExistingWalkinPayment = saveExistingWalkinPayment;

// When user picks a treatment, auto-fill Amount from that service's price.
// Leaves it editable for bargains/promos — the user's sample report showed
// "Hydra" at different prices for different clients, so this is intentional.
function onWalkinServiceChange(){
  const sel = document.getElementById('w-service');
  const priceEl = document.getElementById('w-price');
  if(!sel || !priceEl) return;
  const opt = sel.options[sel.selectedIndex];
  const price = opt ? +opt.getAttribute('data-price') || 0 : 0;
  // Only overwrite if user hasn't typed something non-zero yet, OR the
  // current value matches the previously selected option's price. Simpler:
  // always overwrite — the "optional, editable" hint text already told them
  // to edit after selecting. Keeps behavior predictable.
  if(price > 0) priceEl.value = price;
}
window.onWalkinServiceChange = onWalkinServiceChange;

function saveWalkin(){
  try {
    const fname   = (document.getElementById('w-fname').value||'').trim();
    const lname   = (document.getElementById('w-lname').value||'').trim();
    const phone   = (document.getElementById('w-phone').value||'').trim();
    const address = (document.getElementById('w-address').value||'').trim();
    const svcId   = (document.getElementById('w-service').value||'').trim();
    const product = (document.getElementById('w-product').value||'').trim();
    const amount  = +document.getElementById('w-price').value || 0;
    const method  = document.getElementById('w-method').value || 'Cash';
    const notes   = document.getElementById('w-notes').value || '';
    if(!fname || !lname){ alert('First and last name are required.'); return; }
    if(!phone){ alert('Contact number is required.'); return; }
    if(amount <= 0){ alert('Amount must be greater than 0.'); return; }
    if(!svcId && !product){
      alert('Fill in either a Treatment or a Product (or both).');
      return;
    }
    const branch = DB.session.branch;
    const svc = svcId
      ? (DB.treatments||[]).find(t => String(t.id) === String(svcId))
      : null;

    // ---- Client lookup / create ----
    // Match on fname + lname + same branch (case-insensitive). If found,
    // reuse the existing client id and silently update phone/address if
    // the new values are non-empty and different. If not found, create
    // a new client and sync to Firestore.
    const norm = s => (s||'').trim().toLowerCase();
    // Round 4: clients are shared across branches, so dedup by name only.
    // If the user typed a name that already exists on ANY branch, reuse
    // that client instead of silently creating a duplicate under the
    // current branch.
    let client = (DB.clients||[]).find(c =>
      norm(c.fname) === norm(fname) &&
      norm(c.lname) === norm(lname)
    );
    if(!client){
      client = {
        id: nextId('client'),
        fname, lname,
        phone,
        email: '',                  // no longer UI-captured; preserved for schema
        bday: '',
        gender: 'Female',
        address,
        homeBranch: branch,
        skinSpecialist: '',
        facialist: '',
        medical: '',
        notes: 'Created from Sales › + Add Payment on ' + todayStr(),
        created: Date.now()
      };
      DB.clients.push(client);
      if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
        window.FirestoreCRUD.add('clients', client)
          .catch(err => console.error('Firestore client add error:', err));
      }
    } else {
      // Patch phone/address non-destructively if the reception typed
      // something new. Don't clobber with blanks.
      let touched = false;
      if(phone && phone !== client.phone){ client.phone = phone; touched = true; }
      if(address && address !== client.address){ client.address = address; touched = true; }
      if(touched && window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
        window.FirestoreCRUD.update('clients', String(client.id), client)
          .catch(err => console.error('Firestore client update error:', err));
      }
    }

    // ---- Build the description that shows up on the Sales row ----
    const descParts = [];
    if(svc) descParts.push(svc.name);
    if(product) descParts.push('Product: ' + product);
    const description = descParts.join(' + ') || 'Walk-in payment';

    // ---- Record the payment as a purchase row (type:'service') ----
    // Reusing DB.purchases means we don't have to wire a new Firestore
    // listener into firestore-layer.js. Fields chosen so collectDayPayments
    // picks it up unchanged: paid=true, date=today, branch set, total set.
    const purchaseId = nextId('purchase');
    const rec = {
      id: purchaseId,
      type: 'service',                     // signal to collectDayPayments
      clientId: client.id,
      clientName: client.fname+' '+client.lname,   // denormalized for offline readability
      branch,
      date: todayStr(),
      itemName: description,
      treatmentId: svc ? svc.id : null,
      productText: product,
      qty: 1,
      unitPrice: amount,
      total: amount,
      method,
      paid: true,
      surcharge: 0,
      surchargeWaived: false,
      ref: '',
      notes,
      createdAt: new Date().toISOString(),
      createdBy: (firebase.auth().currentUser && firebase.auth().currentUser.uid) || 'system'
    };
    DB.purchases = DB.purchases || [];
    DB.purchases.push(rec);
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
      window.FirestoreCRUD.add('purchases', rec)
        .catch(err => console.error('Firestore purchase add error:', err));
    }

    saveData();
    closeModal('walkin-modal');
    // Re-render whatever page the user is on. Sales is the likely case.
    if(currentPage === 'sales') renderSales();
    if(currentPage === 'clients') renderClients();
    if(currentPage === 'dashboard') renderDashboard();
    alert('Payment recorded. ' + client.fname + ' ' + client.lname +
      (DB.clients.filter(c => String(c.id) === String(client.id)).length === 1 ? ' added to the Client list.' : ''));
  } catch(e){
    console.error('saveWalkin failed:', e);
    alert('Could not save payment: ' + (e && e.message || e));
  }
}
window.saveWalkin = saveWalkin;

// Removes a walk-in payment. Does NOT delete the auto-created client —
// the client record stands on its own once added (they might still come
// back as a regular customer).
function deleteWalkin(purchaseId){
  try {
    if(!confirm('Remove this payment? The client record stays in the Client list.')) return;
    const id = String(purchaseId);
    const idx = (DB.purchases||[]).findIndex(p => String(p.id) === id);
    if(idx < 0){ alert('Payment not found.'); return; }
    DB.purchases.splice(idx, 1);
    if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD){
      window.FirestoreCRUD.delete('purchases', id)
        .catch(err => console.error('Firestore purchase delete error:', err));
    }
    saveData();
    if(currentPage === 'sales') renderSales();
  } catch(e){
    console.error('deleteWalkin failed:', e);
    alert('Could not delete payment: ' + (e && e.message || e));
  }
}
window.deleteWalkin = deleteWalkin;

function removePayment(pkgId, payId){
  if(!confirm('Remove this payment?')) return;
  const p = DB.packages.find(x => String(x.id) === String(pkgId));
  if(!p){ alert('Package not found.'); return; }
  p.payments = (p.payments||[]).filter(x => String(x.id) !== String(payId));
  // Re-derive sessions paid so it reflects the reduced total payments
  refreshPkgSessionsPaid(p);
  // Sync to Firestore if available
  if(window.useFirebase && window.useFirebase() && window.FirestoreCRUD) {
    window.FirestoreCRUD.update('packages', String(p.id), p).catch(err => console.error("Firestore update error:", err));
  }
  saveData();
  viewPkg(p.id);
  renderPackages();
  renderDashboard();
}

// -------- Upcoming & Follow-ups --------
function daysBetweenStr(a, b){
  // Returns integer days (b - a), both "YYYY-MM-DD"
  const d1 = new Date(a+'T00:00'); const d2 = new Date(b+'T00:00');
  return Math.round((d2-d1)/86400000);
}
function addDaysTo(dateStr, n){
  const d = new Date(dateStr+'T00:00'); d.setDate(d.getDate()+n);
  return dateToLocalStr(d);
}
function computeNextDue(pkg){
  // Returns { nextDue, reason } for an active package; null if not applicable
  if(pkg.status!=='Active') return null;
  const s = pkgStats(pkg);
  if(s.sessionsRemaining<=0) return null;
  if((pkg.sessions||[]).length === 0){
    // Newly availed — call the next day after start to schedule first session
    return { nextDue: addDaysTo(pkg.dateStarted, 1), reason: 'First session — needs scheduling' };
  }
  const last = pkg.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  const gap = pkg.daysBetween||14;
  return { nextDue: addDaysTo(last.date, gap), reason: `Next session due ${gap} days after last (${fmtDate(last.date)})` };
}
function hasUpcomingAppt(pkg){
  // Any future Booked/Confirmed appointment linked to this package
  const today = todayStr();
  return DB.appointments.some(a=> a.packageId===pkg.id
    && (a.status==='Booked' || a.status==='Confirmed')
    && a.date >= today);
}
function getPendingFollowUps(branch){
  const tomorrow = addDaysStr(1);
  const list = [];
  DB.packages.filter(p=>branchMatches(p.branch, branch) && p.status==='Active').forEach(p=>{
    if(hasUpcomingAppt(p)) return;
    const due = computeNextDue(p);
    if(!due) return;
    if(due.nextDue <= tomorrow){
      list.push({ pkg:p, ...due });
    }
  });
  // Sort by earliest due first (overdue on top)
  return list.sort((a,b)=>a.nextDue.localeCompare(b.nextDue));
}

function renderUpcoming(){
  const br = DB.session.branch;
  document.getElementById('up-branch-name').textContent = branchName(br);
  const tomorrow = addDaysStr(1);

  // Tomorrow's confirmed appointments
  const tAppts = DB.appointments
    .filter(a=>branchMatches(a.branch, br) && a.date===tomorrow && a.status!=='Cancelled' && a.status!=='No-show')
    .sort((a,b)=>a.time.localeCompare(b.time));
  const elA = document.getElementById('tomorrow-appts');
  if(!tAppts.length){
    elA.innerHTML = '<div class="empty">No confirmed appointments for tomorrow yet.</div>';
  } else {
    const rows = tAppts.map(a=>{
      const c = findClientById(a.clientId);
      const phone = c && c.phone ? esc(c.phone) : '—';
      const pkg = a.packageId ? DB.packages.find(p=>p.id===a.packageId) : null;
      return `<tr>
        <td>${fmtTime(a.time)}</td>
        <td><b>${c?esc(c.fname+' '+c.lname):'—'}</b><div style="font-size:11px;color:var(--muted)">${phone}</div></td>
        <td>${esc(a.service||'')}${pkg?'<div style="font-size:11px;color:var(--muted)">pkg: '+esc(pkg.packageName)+'</div>':''}</td>
        <td><span class="pill info">${esc(branchName(a.branch))}</span></td>
        <td>${esc(a.therapist||'')}</td>
        <td><span class="pill ${a.status==='Confirmed'?'ok':'info'}">${esc(a.status)}</span></td>
        <td><button class="btn small secondary" onclick="openApptModal(${a.id})">Open</button></td>
      </tr>`;
    }).join('');
    elA.innerHTML = `<table><thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Branch</th><th>Therapist</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // Pending follow-ups
  const pending = getPendingFollowUps(br);
  const elP = document.getElementById('pending-followups');
  if(!pending.length){
    elP.innerHTML = '<div class="empty">✅ Nothing to follow up on. All active packages either have an appointment booked or their next session isn\'t due yet.</div>';
  } else {
    const today = todayStr();
    const rows = pending.map(f=>{
      const p = f.pkg;
      const c = DB.clients.find(x=>x.id===p.clientId);
      const phone = c && c.phone ? c.phone : '';
      const s = pkgStats(p);
      const overdueDays = daysBetweenStr(f.nextDue, today);
      let urgency;
      if(overdueDays>0) urgency = `<span class="pill bad">Overdue ${overdueDays}d</span>`;
      else if(overdueDays===0) urgency = `<span class="pill warn">Due today</span>`;
      else urgency = `<span class="pill info">Due tomorrow</span>`;
      return `<tr>
        <td>${urgency}</td>
        <td><b>${c?esc(c.fname+' '+c.lname):'—'}</b>${phone?'<div style="font-size:11px;color:var(--muted)">'+esc(phone)+'</div>':''}</td>
        <td>${esc(p.packageName)}<div style="font-size:11px;color:var(--muted)">${s.sessionsUsed}/${p.totalSessions} sessions used</div></td>
        <td><div>${fmtDate(f.nextDue)}</div><div style="font-size:11px;color:var(--muted)">${esc(f.reason)}</div></td>
        <td>
          ${phone?`<a class="btn small secondary" href="tel:${esc(phone)}">📞 Call</a> `:''}
          ${phone?`<a class="btn small secondary" href="sms:${esc(phone)}">💬 SMS</a> `:''}
          <button class="btn small" onclick="bookFromFollowUp(${p.id})">📅 Book</button>
        </td>
      </tr>`;
    }).join('');
    elP.innerHTML = `<table><thead><tr><th>Urgency</th><th>Client</th><th>Package</th><th>Recommended Date</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}

function bookFromFollowUp(pkgId){
  const p = DB.packages.find(x=>x.id===pkgId);
  if(!p) return;
  const due = computeNextDue(p);
  openApptModal(null, due ? due.nextDue : addDaysStr(1));
  // Pre-fill client + package
  setTimeout(()=>{
    document.getElementById('a-client').value = p.clientId;
    fillPackageSelect(p.clientId, p.id);
    document.getElementById('a-service').value = p.packageName;
  }, 0);
}

function updateUpcomingBadge(){
  const badge = document.getElementById('nav-upcoming-badge');
  if(!badge) return;
  const br = DB.session.branch;
  const pending = getPendingFollowUps(br).length;
  const tomorrow = addDaysStr(1);
  const tAppts = DB.appointments.filter(a=>branchMatches(a.branch, br) && a.date===tomorrow && a.status!=='Cancelled' && a.status!=='No-show').length;
  const total = pending + tAppts;
  if(total>0){ badge.textContent = total; badge.style.display = 'inline-block'; }
  else { badge.style.display = 'none'; }
}

// -------- Settings --------
function renderSettings(){
  const rows = DB.branches.map(b=>`<tr>
    <td><b>${esc(b.name)}</b></td>
    <td>${esc(b.address||'')}</td>
    <td>${esc(b.phone||'')}</td>
    <td style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn small secondary" onclick="openBranchModal('${esc(String(b.id))}')">Edit</button>
      <button class="btn small danger" onclick="deleteBranch('${esc(String(b.id))}')">Delete</button>
    </td>
  </tr>`).join('');
  document.getElementById('branches-list').innerHTML = `<table><thead><tr><th>Branch</th><th>Address</th><th>Phone</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
  // Services catalog now lives on its own page (#page-services). We still
  // render it here defensively so that if anyone lands on Settings while the
  // services list hasn't been drawn yet, the DOM is populated.
  renderTreatments();
}
function renderServices(){
  // Dedicated page for the Services Catalog. Thin wrapper around
  // renderTreatments() so showPage('services') has something to call.
  renderTreatments();
}
window.renderServices = renderServices;

function branchSlug(name){
  const base = (name||'').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
  return base || ('branch-' + Date.now());
}

function openBranchModal(id){
  if(!requireAdminPassword(id ? 'Editing a branch' : 'Adding a new branch')) return;
  if(id){
    const b = DB.branches.find(x=>String(x.id)===String(id));
    if(!b){ alert('Branch not found.'); return; }
    document.getElementById('branch-modal-title').textContent = 'Edit Branch';
    document.getElementById('branch-id').value = b.id;
    document.getElementById('branch-name').value = b.name||'';
    document.getElementById('branch-address').value = b.address||'';
    document.getElementById('branch-phone').value = b.phone||'';
  } else {
    document.getElementById('branch-modal-title').textContent = 'Add Branch';
    document.getElementById('branch-id').value = '';
    document.getElementById('branch-name').value = '';
    document.getElementById('branch-address').value = '';
    document.getElementById('branch-phone').value = '';
  }
  openModal('branch-modal');
}

function getBranchUsageSummary(branchId){
  const usage = {
    clients: DB.clients.filter(c=>(c.homeBranch||'')===branchId).length,
    appointments: DB.appointments.filter(a=>(a.branch||'')===branchId).length,
    inventory: DB.inventory.filter(i=>(i.branch||'')===branchId).length,
    packages: DB.packages.filter(p=>(p.branch||'')===branchId).length,
    expenses: (DB.expenses||[]).filter(e=>(e.branch||'')===branchId).length,
    purchases: (DB.purchases||[]).filter(p=>(p.branch||'')===branchId).length,
    payments: (DB.payments||[]).filter(p=>(p.branch||'')===branchId).length,
    sessions: (DB.sessions||[]).filter(s=>(s.branch||'')===branchId).length,
  };
  usage.total = Object.values(usage).reduce((sum,v)=>sum + (typeof v === 'number' ? v : 0), 0);
  return usage;
}

async function deleteBranch(branchId){
  if(!requireAdminPassword('Deleting a branch')) return;
  const branch = DB.branches.find(b=>String(b.id)===String(branchId));
  if(!branch){ alert('Branch not found.'); return; }
  if(DB.branches.length <= 1){ alert('You must keep at least one branch.'); return; }

  const usage = getBranchUsageSummary(branchId);
  if(usage.total > 0){
    alert(`Cannot delete ${branch.name} yet. It still has:\n\nClients: ${usage.clients}\nAppointments: ${usage.appointments}\nInventory: ${usage.inventory}\nPackages: ${usage.packages}\nExpenses: ${usage.expenses}\nPurchases: ${usage.purchases}\nPayments: ${usage.payments}\nSessions: ${usage.sessions}`);
    return;
  }

  if(!confirm(`Delete branch "${branch.name}"? This cannot be undone.`)) return;

  DB.branches = DB.branches.filter(b=>String(b.id)!==String(branchId));
  if(DB.session && DB.session.branch === branchId){
    DB.session.branch = DB.branches[0].id;
  }

  if(window.useFirebase && window.useFirebase()){
    try {
      await firebase.firestore().collection('branches').doc(String(branchId)).delete();
    } catch(err){
      console.error('Firestore branch delete error:', err);
    }
  }

  saveData();
  refreshBranchSelectors();
  renderSettings();
  refreshAll();
}

async function saveBranch(){
  const id = document.getElementById('branch-id').value;
  const name = document.getElementById('branch-name').value.trim();
  const address = document.getElementById('branch-address').value.trim();
  const phone = document.getElementById('branch-phone').value.trim();
  if(!name){ alert('Branch name is required.'); return; }
  const dupBranch = findDuplicateBranch(name, id);
  if(dupBranch){
    alert('A branch with that name already exists.');
    return;
  }

  if(id){
    const idx = DB.branches.findIndex(x=>String(x.id)===String(id));
    if(idx<0){ alert('Branch not found.'); return; }
    DB.branches[idx] = {...DB.branches[idx], name, address, phone};
    if(window.useFirebase && window.useFirebase()){
      try {
        await firebase.firestore().collection('branches').doc(String(id)).set({
          name, address, phone, updatedAt: new Date()
        }, { merge:true });
      } catch(err){
        console.error('Firestore branch update error:', err);
      }
    }
  } else {
    let newId = branchSlug(name);
    let n = 2;
    while(DB.branches.some(b=>String(b.id)===newId)){
      newId = `${branchSlug(name)}-${n++}`;
    }
    const rec = { id:newId, name, address, phone };
    DB.branches.push(rec);
    if(window.useFirebase && window.useFirebase()){
      try {
        await firebase.firestore().collection('branches').doc(String(newId)).set({
          name, address, phone, createdAt: new Date()
        }, { merge:true });
      } catch(err){
        console.error('Firestore branch add error:', err);
      }
    }
  }

  saveData();
  refreshBranchSelectors();
  closeModal('branch-modal');
  renderSettings();
}
function exportAllData(){
  if(!requireAdminPassword('Exporting all clinic data')) return;
  const blob = new Blob([JSON.stringify(DB,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `awera-backup-${todayStr()}.json`;
  a.click();
}
// Stub invoked by the hidden file input's onchange; actual work lives in
// `importData` below. This function runs *before* the file picker opens so
// the password is checked up front. If the user cancels, we never open the
// file picker.
function startImportData(){
  if(!requireAdminPassword('Importing a data backup (this REPLACES current data)')) return;
  document.getElementById('import-file').click();
}
async function importData(ev){
  // Belt-and-suspenders: if someone fires the hidden <input> directly (e.g.
  // via DevTools), re-check the password here too. No-op if already unlocked.
  if(!requireAdminPassword('Importing a data backup (this REPLACES current data)')){
    ev.target.value = ''; // clear the chosen file so changing again re-triggers
    return;
  }
  const f = ev.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = async e=>{
    try {
      DB = JSON.parse(e.target.result);
      window.DB = DB;
      saveData();
      if(window.useFirebase && window.useFirebase() && window.replaceAllDataInFirestore){
        await window.replaceAllDataInFirestore(DB);
      } else if(window.useFirebase && window.useFirebase() && window.syncAllDataToFirestore){
        await window.syncAllDataToFirestore();
      }
      alert('Data imported and saved');
      location.reload();
    }
    catch(err){ alert('Invalid file'); }
  };
  r.readAsText(f);
}
function resetAllData(){
  if(!requireAdminPassword('Resetting ALL data back to demo seed')) return;
  if(!confirm('This will delete ALL data and restore the demo seed. Are you sure?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// -------- Shared --------
function fillBranchSelect(id){
  document.getElementById(id).innerHTML = DB.branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
}
function refreshBranchSelectors(){
  const sel = document.getElementById('login-branch');
  const topSel = document.getElementById('branch-selector');
  const prevLogin = sel ? (sel.value || (DB.session && DB.session.branch) || 'gerona') : 'gerona';
  const prevTop = topSel ? (topSel.value || (DB.session && DB.session.branch) || 'gerona') : 'gerona';
  const branches = (DB.branches||[]).filter(b=>b && b.id && b.name);
  if(!branches.length) return;
  const html = branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
  if(sel){
    sel.innerHTML = html;
    sel.value = branches.some(b=>b.id===prevLogin) ? prevLogin : branches[0].id;
  }
  if(topSel){
    topSel.innerHTML = html;
    topSel.value = branches.some(b=>b.id===prevTop) ? prevTop : branches[0].id;
  }
}
window.refreshBranchSelectors = refreshBranchSelectors;
window.refreshLoginBranchOptions = refreshBranchSelectors;
function fillClientSelect(id){
  const br = DB.session.branch;
  const sorted = DB.clients.filter(c=>branchMatches(c.homeBranch, br)).slice().sort((a,b)=>(a.lname+a.fname).localeCompare(b.lname+b.fname));
  document.getElementById(id).innerHTML = '<option value="">-- select client --</option>' + sorted.map(c=>`<option value="${c.id}">${esc(c.lname+', '+c.fname)} ${c.phone?'('+esc(c.phone)+')':''}</option>`).join('');
}
function openModal(id){
  const backdrop = document.getElementById(id);
  if(!backdrop) return;
  backdrop.classList.add('active');
  // Defensive inline styles in case external CSS overrides generic ".modal" rules.
  backdrop.style.display = 'flex';
  backdrop.style.zIndex = '1000';
  const card = backdrop.querySelector('.modal') || backdrop.firstElementChild;
  if(card){
    card.style.display = 'block';
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.position = 'relative';
    card.style.zIndex = '1001';
  }
}
function closeModal(id){
  const backdrop = document.getElementById(id);
  if(!backdrop) return;
  backdrop.classList.remove('active');
  backdrop.style.display = '';
  backdrop.style.zIndex = '';
  const card = backdrop.querySelector('.modal') || backdrop.firstElementChild;
  if(card){
    card.style.display = '';
    card.style.opacity = '';
    card.style.visibility = '';
    card.style.position = '';
    card.style.zIndex = '';
  }
}

function refreshAll(){
  if(currentPage==='dashboard') renderDashboard();
  if(currentPage==='upcoming') renderUpcoming();
  if(currentPage==='clients') renderClients();
  if(currentPage==='schedule') renderSchedule();
  if(currentPage==='inventory') renderInventory();
  if(currentPage==='packages') renderPackages();
  if(currentPage==='sales'){
    // Default the date picker to today on first entry / when empty
    const dateEl = document.getElementById('sales-date');
    if(dateEl && !dateEl.value) dateEl.value = todayStr();
    renderSales();
  }
  if(currentPage==='services') renderServices();
  if(currentPage==='settings') renderSettings();
  updateUpcomingBadge();
}

// -------- Boot --------
// Firebase Auth state listener - restore session if user already logged in
window.onFirebaseReady = function(firebaseUser) {
  if(firebaseUser) {
    console.log("🔐 Restoring Firebase session for:", firebaseUser.email);
    SessionManager.setFirebaseUser(firebaseUser, DB.session?.branch || document.getElementById('login-branch')?.value || 'gerona');
    console.log("✅ Session restored from Firebase auth");
  }
};

window.addEventListener('DOMContentLoaded', ()=>{
  refreshBranchSelectors();
  // Check if Firebase has initialized with a user
  if(window.isFirebaseReady && window.isFirebaseReady()) {
    const firebaseUser = window.getCurrentFirebaseUser ? window.getCurrentFirebaseUser() : null;
    if(firebaseUser && typeof window.onFirebaseReady === 'function') {
      console.log("🔐 Firebase user found on load, restoring session...");
      window.onFirebaseReady(firebaseUser);
      return;
    }
  }

  // If Firebase auth hasn't finished yet, give it a short moment before falling back.
  setTimeout(()=>{
    const firebaseUser = window.getCurrentFirebaseUser ? window.getCurrentFirebaseUser() : null;
    if(firebaseUser && typeof window.onFirebaseReady === 'function' && (!DB.session || !DB.session.user)){
      console.log("🔐 Firebase user found after initial load, restoring session...");
      window.onFirebaseReady(firebaseUser);
      return;
    }
    if(window.SessionManager && window.SessionManager && window.SessionManager._didRestore) return;
  }, 500);
  
  // Check localStorage for existing session (non-Firebase fallback)
  if(DB.session && DB.session.user){
    document.getElementById('login-overlay').style.display='none';
    document.getElementById('branch-selector').value = DB.session.branch;
    document.getElementById('user-pill').textContent = DB.session.user.name + ' (' + DB.session.user.role + ')';
    refreshAll();
    // Also refresh after Firestore listeners connect (1-2 seconds)
    setTimeout(() => forceRefreshAllUI(), 1500);
  }
});
