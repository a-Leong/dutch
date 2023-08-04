import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import admin from "firebase-admin";
import { config } from "dotenv";

config({ path: ".env.local" });

if (process.env.GCP_SA_KEY === undefined) {
  throw new Error("Firebase admin SDK credentials not found in ENV.");
}

const app = initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GCP_SA_KEY)),
  databaseURL: "https://dutch-cards-default-rtdb.firebaseio.com",
});

export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);
