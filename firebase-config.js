// Firebase configuration
// UPDATED: Enhanced error handling and connection monitoring

const firebaseConfig = {
  apiKey: "AIzaSyDuuWAyqoOeVfi1w2iTzN-MAgQOQTN08FU",
  authDomain: "class-website-15f2b.firebaseapp.com",
  databaseURL: "https://class-website-15f2b-default-rtdb.firebaseio.com",
  projectId: "class-website-15f2b",
  storageBucket: "class-website-15f2b.firebasestorage.app",
  messagingSenderId: "635018275617",
  appId: "1:635018275617:web:132bed8d2bf25019edac60",
  measurementId: "G-T4N7V4F339"
};

// Initialize Firebase with error handling
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  alert('Failed to initialize Firebase. Please check your internet connection.');
}

// Initialize services
const auth = firebase.auth();
const database = firebase.database();

// Enable offline persistence for better user experience
database.ref('.info/connected').on('value', (snapshot) => {
  if (snapshot.val() === true) {
    console.log('🟢 Connected to Firebase');
  } else {
    console.log('🔴 Disconnected from Firebase');
  }
});

// CRITICAL: Set database persistence
database.goOnline();

// Auth state observer with enhanced logging
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('👤 User logged in:', user.email);
    console.log('👤 User UID:', user.uid);
    
    // Update last activity
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      database.ref('users/' + user.uid + '/lastActivity').set(firebase.database.ServerValue.TIMESTAMP);
    }
  } else {
    console.log('👤 No user logged in');
  }
});

// Helper function to check Firebase connection
window.checkFirebaseConnection = async function() {
  try {
    const connectedRef = database.ref('.info/connected');
    const snapshot = await connectedRef.once('value');
    const connected = snapshot.val();
    console.log('Firebase connection status:', connected ? 'CONNECTED' : 'DISCONNECTED');
    return connected;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

// Helper function to test database read
window.testDatabaseRead = async function() {
  try {
    const testRef = database.ref('users');
    const snapshot = await testRef.limitToFirst(1).once('value');
    console.log('✅ Database read test successful');
    console.log('Sample data:', snapshot.val());
    return true;
  } catch (error) {
    console.error('❌ Database read test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};

console.log('🔥 Firebase Config Loaded - Use window.checkFirebaseConnection() and window.testDatabaseRead() to test');