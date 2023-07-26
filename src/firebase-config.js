import { initializeApp } from "firebase/app";
import { ref } from "firebase/database";
import { getFirestore, doc } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAQq-J1pa3L5s98wLyqLS1Luwt9zScULqk",
  authDomain: "dutch-cards.firebaseapp.com",
  projectId: "dutch-cards",
  storageBucket: "dutch-cards.appspot.com",
  messagingSenderId: "865774696",
  appId: "1:865774696:web:c4dfb50657f2a6124b5fdd",
  measurementId: "G-J0K8YWTX23",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const database = getDatabase(firebaseApp);

// Convinience Firestore refs
export const sandboxDocRef = doc(firestore, "admin/sandbox");
export const sandboxRTRef = ref(database, "sandbox/count");
