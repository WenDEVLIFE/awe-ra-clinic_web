# Awe-RA Aesthetic & Wellness Clinic Management System

A single-page clinic management app for Awe-RA Aesthetic & Wellness Clinic. The app is designed for Firebase Hosting, Firebase Authentication, and Firestore-backed realtime data, with localStorage used as a fallback and temporary cache layer.

## Overview

The system manages clinic operations across multiple branches, currently centered on:

- Gerona, Tarlac (Main)
- Paniqui, Tarlac

The app includes branch-scoped views for scheduling, inventory, packages, sales, and dashboard metrics, while shared client records and settings can be managed across the system.

## Core Features

- Firebase Authentication with persistent login sessions
- Firestore realtime sync for clinic data
- Branch-aware dashboard and scheduling views
- Client records with create, edit, delete, and balance tracking
- Appointment scheduling with upcoming schedule and follow-up workflow
- Inventory management and stock transfers between branches
- Package management with sessions, payments, and package history
- Sales and expense tracking by branch
- Branch management in settings with add, edit, and delete controls
- Import/export backup support
- LocalStorage fallback when Firebase is unavailable

## Project Structure

- public/index.html: Main application shell, navigation, modals, and Firebase script loading
- public/styles.css: UI styling for the app
- public/firebase-config.js: Firebase initialization, auth handling, and hybrid data layer helpers
- public/firestore-layer.js: Firestore load/sync listeners and import restore helpers
- public/script.js: Main application logic, rendering, CRUD operations, branch logic, and modal behavior
- firebase.json: Firebase Hosting configuration and SPA rewrite rules

## Runtime Architecture

The app uses a hybrid data approach:

1. Firebase Auth signs the user in and keeps the session persistent.
2. Firestore is loaded into the in-memory DB on startup.
3. Realtime Firestore listeners update the UI when data changes.
4. localStorage acts as a backup cache and fallback.
5. Import/export can restore the database from a JSON backup.

Firestore is the primary source of truth when Firebase is active, but the app still keeps a localStorage copy so the UI can recover if Firebase is unavailable.

## Firebase Setup

The app uses the Firebase compat SDK loaded from the CDN in the HTML entry point. The active Firebase project is configured in the app code and connected to Hosting, Auth, and Firestore.

Important behavior:

- Authentication uses email and password
- Auth persistence is set to LOCAL so users stay signed in after refresh
- Firestore collections are watched in realtime
- Hosting is configured as a single-page app with all routes rewritten to index.html

## Data Collections

The app works with these Firestore collections:

- clients
- appointments
- inventory
- packages
- treatments
- expenses
- purchases
- branches
- payments
- sessions

Each document is stored with its document ID matching the app record ID when data is synced or restored from backup.

## Main User Flows

### Login

Users log in with Firebase Auth. The branch selected on the login screen determines the active branch context after sign-in.

### Dashboard

The dashboard shows branch-scoped counts and today’s operational status, including:

- total clients
- today’s appointments
- upcoming appointments
- low stock items
- active packages
- outstanding balance

### Clients

Client records can be created, edited, searched, and deleted. The app also calculates balances by combining package and purchase data.

### Scheduling

Appointments can be added, edited, and deleted. The schedule page shows the calendar and a list of upcoming appointments. The upcoming page highlights tomorrow’s confirmed appointments and package follow-ups.

### Inventory

Inventory items are tracked per branch. The app supports:

- create and edit item records
- stock count updates
- branch-to-branch transfers
- low stock monitoring

### Packages

Packages track multi-session services. The system stores:

- client
- treatment
- branch
- total sessions
- price per session
- total price
- downpayment
- session history
- payment history

### Sales

Sales combines package payments and product purchases, and also tracks expenses to calculate net profit for the selected date and branch.

### Settings and Branches

Settings includes branch administration. You can add, edit, or delete branches, with safety checks that prevent deleting a branch that still has dependent records.

## Duplicate Protection

The save handlers include duplicate checks before writing data:

- Clients: prevents duplicate client names in the same branch
- Branches: prevents duplicate branch names
- Appointments: prevents the same client from having more than one appointment on the same day in the same branch
- Inventory: prevents duplicate item names in the same branch
- Packages: prevents duplicate packages for the same client, treatment, and branch

## Import and Export

### Export

Export creates a JSON backup of the current in-memory database.

### Import

Import restores a backup file into the app and, when Firebase is active, also writes the imported data back to Firestore. The restore flow replaces existing Firestore documents in the supported collections so the imported file becomes the active dataset.

## Deployment

This project is deployed to Firebase Hosting with SPA rewrite rules.

To deploy manually:

```bash
firebase deploy --only hosting
```

To deploy the full Firebase project:

```bash
firebase deploy
```

## Local Development Notes

- The app is a static Firebase Hosting SPA.
- Changes in public/script.js and public/firestore-layer.js control most runtime behavior.
- Realtime updates depend on Firebase being available and the user being authenticated.
- If Firebase is not available, the app falls back to localStorage behavior.

## Troubleshooting

### User is unexpectedly logged out

Check that Firebase Auth is working and that persistence is still set to LOCAL in the auth flow.

### Data does not appear after import

Make sure the imported JSON matches the app’s structure and that Firebase is connected if you expect the import to write to Firestore.

### Realtime data seems stale

Confirm that the Firestore listeners are active and that the app has finished its initial Firebase load.

### Duplicate records are blocked

This is intentional. The app now prevents common duplicate records to avoid inconsistent branch and scheduling data.

## Notes for Maintainers

- Keep branch IDs and names normalized across the app.
- Treat Firestore as the source of truth when Firebase is active.
- Preserve localStorage fallback behavior unless you are ready for a full Firestore-only migration.
- If you add new collections, update the Firestore sync and import restore helpers so backups remain complete.
