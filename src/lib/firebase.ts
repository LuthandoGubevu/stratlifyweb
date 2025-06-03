import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// Import getAnalytics and isSupported specifically
import { getAnalytics as getFirebaseAnalytics, isSupported as isAnalyticsSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBCF0I2mGDVXLvorGYx-wfYLkdSp86nrYw",
  authDomain: "stratifyai-d82ce.firebaseapp.com",
  projectId: "stratifyai-d82ce",
  storageBucket: "stratifyai-d82ce.appspot.com",
  messagingSenderId: "716269216529",
  appId: "1:716269216529:web:f5a20f79f72e48a29f62b0", // Using appId from your guide
  measurementId: "G-RRPPBQV3MY"
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Declare analytics, it will be null on the server or if not supported/initialized on client
let analytics: Analytics | null = null;

// Initialize analytics only on the client side and if supported
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getFirebaseAnalytics(app);
    } else {
      console.log("Firebase Analytics is not supported in this browser.");
    }
  }).catch(err => {
    console.error("Error checking Firebase Analytics support:", err);
  });
}

export { app, auth, db, storage, analytics };
