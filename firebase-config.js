const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('\n❌  ERROR: firebase-service-account.json not found in project root!');
    console.error('   1. Go to https://console.firebase.google.com');
    console.error('   2. Project Settings → Service Accounts → Generate new private key');
    console.error('   3. Save the downloaded JSON as firebase-service-account.json in the project root\n');
    process.exit(1);
}

if (!admin.apps.length) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
module.exports = { db, admin };
