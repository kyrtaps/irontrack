import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmBrtKzSriaF0RHPMkrngNKvaRFQQEYFE",
  authDomain: "irontrack-240e2.firebaseapp.com",
  projectId: "irontrack-240e2",
  storageBucket: "irontrack-240e2.firebasestorage.app",
  messagingSenderId: "532511027704",
  appId: "1:532511027704:web:396e2c79f4749373a3260d",
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
