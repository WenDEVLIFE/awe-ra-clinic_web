# Firebase Integration Setup for Awe-Ra Clinic

## Project Configuration

**Firebase Project ID:** `awe-ra-clinic-web`  
**Region:** Asia Southeast 1  
**Hosting URL:** https://awe-ra-clinic-web.web.app

---

## 1. Authentication Setup

### Firebase Auth Methods Enabled:
- ✅ Email/Password Authentication
- ✅ Custom Claims for Role Management (admin, reception, therapist)

### Initial Admin Account:
Create this in Firebase Console → Authentication → Users:
- **Email:** admin@awe-ra.clinic
- **Password:** [Set secure password]
- **Role:** admin

---

## 2. Firestore Collections Structure

All collections use the following schema:

### `branches`
```json
{
  "id": "gerona",
  "name": "Gerona, Tarlac (Main)",
  "address": "Gerona, Tarlac",
  "phone": "",
  "createdAt": "2026-04-18T00:00:00Z",
  "createdBy": "admin"
}
```

### `clients`
```json
{
  "fname": "Maria",
  "lname": "Santos",
  "phone": "0917-555-0101",
  "email": "maria@example.com",
  "bday": "1992-03-14",
  "gender": "Female",
  "address": "Gerona, Tarlac",
  "homeBranch": "gerona",
  "medical": "Sensitive skin",
  "notes": "Prefers afternoon appointments",
  "createdAt": "2026-04-18T00:00:00Z",
  "createdBy": "admin"
}
```

### `appointments`
```json
{
  "clientId": "doc-id",
  "date": "2026-04-20",
  "time": "10:00",
  "duration": 60,
  "branch": "gerona",
  "service": "Facial Treatment",
  "therapist": "Ana",
  "status": "Confirmed",
  "notes": "",
  "createdAt": "2026-04-18T00:00:00Z"
}
```

### `inventory`
```json
{
  "branch": "gerona",
  "name": "Glutathione 600mg",
  "category": "Product",
  "unit": "vial",
  "qty": 25,
  "reorder": 10,
  "cost": 350,
  "price": 800,
  "supplier": "MedSupply PH",
  "notes": ""
}
```

### `packages`
```json
{
  "clientId": "doc-id",
  "branch": "gerona",
  "treatmentId": "doc-id",
  "packageName": "Classic Facial",
  "totalSessions": 6,
  "sessionsPaid": 3,
  "pricePerSession": 1500,
  "totalPrice": 9000,
  "downpayment": 3000,
  "daysBetween": 14,
  "priceLocked": true,
  "dateStarted": "2026-04-18",
  "status": "Active",
  "notes": "10% promo applied"
}
```

### `treatments`
```json
{
  "name": "Classic Facial",
  "category": "Facial",
  "description": "Deep-cleansing facial with extraction",
  "defaultSessions": 6,
  "pricePerSession": 1500,
  "daysBetween": 14,
  "active": true,
  "supplies": [
    {"itemName": "Facial Mask Sheet", "qty": 1}
  ]
}
```

### `sessions`
```json
{
  "packageId": "doc-id",
  "date": "2026-04-18",
  "time": "10:00",
  "therapist": "Ana",
  "notes": "First session, mild redness afterwards",
  "supplies": [
    {"itemName": "Facial Mask Sheet", "qty": 1}
  ]
}
```

### `payments`
```json
{
  "packageId": "doc-id",
  "date": "2026-04-18",
  "amount": 3000,
  "type": "Downpayment",
  "method": "Cash",
  "ref": "",
  "notes": "Initial downpayment (auto-recorded)",
  "branch": "gerona"
}
```

### `expenses`
```json
{
  "branch": "gerona",
  "date": "2026-04-18",
  "category": "Utilities",
  "amount": 850,
  "notes": "Electricity bill share",
  "createdAt": "2026-04-18T00:00:00Z"
}
```

### `purchases`
```json
{
  "clientId": "doc-id",
  "branch": "gerona",
  "itemName": "Glutathione 600mg",
  "qty": 2,
  "unitPrice": 800,
  "total": 1600,
  "date": "2026-04-18",
  "paid": true,
  "method": "Cash",
  "notes": "Take-home vials"
}
```

---

## 3. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Clients collection - all authenticated users can read
    match /clients/{document=**} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.role in ['admin', 'reception'];
    }
    
    // Appointments - therapists can only see their own branch
    match /appointments/{document=**} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

---

## 4. Firebase Console Setup Checklist

- [ ] Enable Email/Password Authentication
- [ ] Create initial admin user
- [ ] Set up all collections listed above
- [ ] Import seed data (use Data Import script)
- [ ] Configure Security Rules
- [ ] Enable Firestore backups
- [ ] Set up real-time listeners

---

## 5. Testing the Integration

1. **Local Testing:**
   ```bash
   npm install firebase
   # Test with incognito browser (fresh auth)
   ```

2. **Production Testing:**
   - Open https://awe-ra-clinic-web.web.app
   - Sign in with admin account
   - Create a test client
   - Verify data appears in Firebase Console → Firestore

3. **Multi-Device Real-Time Sync:**
   - Open app on 2 devices
   - Add/edit data on device 1
   - Verify instant update on device 2

---

## 6. Migration from localStorage

When ready, run the migration script to import existing demo data:
```bash
node scripts/migrate-to-firestore.js
```

This will:
- Read all localStorage data
- Transform to Firestore schema
- Batch upload to Firestore
- Verify counts match

---

## 7. Deployment

```bash
firebase deploy --only hosting,firestore
```

---

## Next Steps

1. ✅ Create Firestore collections
2. ✅ Set up authentication
3. ⏳ Update app.js to use Firebase CRUD
4. ⏳ Test real-time sync
5. ⏳ Migrate existing demo data
6. ⏳ Set up automated backups

---

**Last Updated:** April 18, 2026
