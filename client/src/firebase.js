import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0UFFEKQFQ44yYKamDV-VCElf8TrBVcq8",
  authDomain: "zyrisai.firebaseapp.com",
  projectId: "zyrisai",
  storageBucket: "zyrisai.firebasestorage.app",
  messagingSenderId: "533964366467",
  appId: "1:533964366467:web:49747a2cb33defeba6f1b6",
  measurementId: "G-JRCZZMGT8K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom OAuth settings to ensure clean prompt handling
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result; // Return full credential object for App.jsx metadata checks
};

export const signUpWithEmail = async (email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const logoutUser = () => signOut(auth);