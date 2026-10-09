import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIcM8LeIfFiYk1AHK0_xbn9NhKYrR5DZo",
  authDomain: "projeto-iv-e3323.firebaseapp.com",
  projectId: "projeto-iv-e3323",
  storageBucket: "projeto-iv-e3323.firebasestorage.app",
  messagingSenderId: "191444655371",
  appId: "1:191444655371:web:40e8104f40e81f7249160e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);