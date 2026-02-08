import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmB-k8EDxlyqGbCiuT2tz4as_dimCoAIY",
  authDomain: "townhall-a5aa0.firebaseapp.com",
  projectId: "townhall-a5aa0",
  storageBucket: "townhall-a5aa0.firebasestorage.app",
  messagingSenderId: "433013416546",
  appId: "1:433013416546:web:76b4a51f20d4d61207a73b",
  measurementId: "G-C6HFH6H27Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
