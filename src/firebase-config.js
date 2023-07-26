import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQq-J1pa3L5s98wLyqLS1Luwt9zScULqk",
  authDomain: "dutch-cards.firebaseapp.com",
  projectId: "dutch-cards",
  storageBucket: "dutch-cards.appspot.com",
  messagingSenderId: "865774696",
  appId: "1:865774696:web:c4dfb50657f2a6124b5fdd",
  measurementId: "G-J0K8YWTX23",
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore();
