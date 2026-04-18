# Firebase Console Setup Checklist

## Your Project
- **Project ID:** `awe-ra-clinic-web`
- **Console URL:** https://console.firebase.google.com/project/awe-ra-clinic-web

---

## ✅ Step 1: Enable Firebase Authentication

1. Go to Firebase Console → **Authentication** (left sidebar)
2. Click **Get Started**
3. Click **Email/Password**
4. Toggle **Enable** (turn ON)
5. Click **Save**

**Status:** ✅ Email/Password Auth enabled

---

## ✅ Step 2: Create Initial Admin User

1. In Authentication tab, click **Users**
2. Click **Add user**
3. Enter:
   - **Email:** `admin@awe-ra.clinic`
   - **Password:** `Demo123!@#` (change to secure password)
4. Click **Add user**

**Status:** ✅ Admin user created

---

## ✅ Step 3: Set Up Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose location: **Singapore** (closest to Philippines)
4. Security rules: **Start in test mode** (temporarily)
5. Click **Create**

**Status:** ✅ Firestore database created

---

## ✅ Step 4: Create Firestore Collections

In Firestore Database, create these collections (click "Start collection"):

1. **branches** (empty for now)
2. **clients** (empty for now)
3. **appointments** (empty for now)
4. **inventory** (empty for now)
5. **treatments** (empty for now)
6. **packages** (empty for now)
7. **payments** (empty for now)
8. **sessions** (empty for now)
9. **expenses** (empty for now)
10. **purchases** (empty for now)

**Status:** ✅ All collections created

---

## ⏳ Step 5: (Optional) Update Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace with security rules from `FIREBASE_SETUP.md`
3. Click **Publish**

**Note:** For now, test mode allows anyone to read/write. Update this before production.

---

## ✅ Step 6: Test the Integration

1. **Deploy the app:**
   ```bash
   firebase deploy --only hosting
   ```

2. **Open the live app:**
   - https://awe-ra-clinic-web.web.app

3. **Look for Firebase status indicator:**
   - Bottom right corner: "Firebase: Connected ✓" or "Firebase: Demo Mode"

4. **Test login (optional):**
   - Use demo credentials still work (email/password from code)
   - Or sign up with email from step 2

---

## ❌ If Firebase shows "Offline (localStorage)":

This is **normal for demo mode**. Your app is using localStorage as fallback.

To enable real Firebase:
1. Make sure you're signed in with a Firebase user account
2. Hard refresh the browser (Cmd+Shift+R)
3. Check browser console (F12) for any errors

---

## 🚀 Next Steps

1. **Seed Demo Data into Firestore:**
   - Export demo data from localStorage
   - Import into Firestore

2. **Set up real-time listeners:**
   - Data syncs across all devices in real-time

3. **Configure role-based access:**
   - Admin, reception, therapist roles with permissions

4. **Enable multi-branch real-time sync:**
   - Staff in Gerona and Paniqui see updates instantly

---

## 📞 Support

If you need help:
- Check browser console (F12) for error messages
- Verify all collections exist in Firestore Database
- Confirm admin user is created in Authentication
- Make sure Hosting is deployed with `firebase deploy --only hosting`

---

**Last Updated:** April 18, 2026
