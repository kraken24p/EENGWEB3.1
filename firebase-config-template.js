// firebase-config-template.js
// This is a TEMPLATE - copy to firebase-config.js and fill in real values

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    databaseURL: "YOUR_DATABASE_URL_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE",
    measurementId: "YOUR_MEASUREMENT_ID_HERE"
  };
  
  // Initialize Firebase (same as before)
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();