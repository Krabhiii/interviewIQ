
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-aaa83.firebaseapp.com",
  projectId: "interviewiq-aaa83",
  storageBucket: "interviewiq-aaa83.firebasestorage.app",
  messagingSenderId: "1018444450874",
  appId: "1:1018444450874:web:842bf5efbd68d865fd7903"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
export {auth,provider}