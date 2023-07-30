import { defineStore } from "pinia";
import { useDocument, useDatabaseObject } from "vuefire";
import { doc as firestoreDoc } from "firebase/firestore";
import { ref as databaseRef } from "firebase/database";

import { database, firestore } from "@/firebase-config";

export const useSandboxStore = defineStore("sandbox", () => {
  const ws = new WebSocket("wss://dutch-cards-server.fly.dev");
  // const ws = new WebSocket("ws://localhost:3000");

  ws.addEventListener("close", () =>
    console.log("WebSocket connection closed")
  );
  ws.addEventListener("error", console.error);
  ws.addEventListener("message", (data) =>
    console.log("received: %s", data.data)
  );

  //
  // Firestore
  //

  const sandboxDocRef = firestoreDoc(firestore, "admin/sandbox");
  const doc = /** @type {import("@/models/sandbox").SandboxFS} */ (
    useDocument(sandboxDocRef)
  );

  function incrementDocCount() {
    ws.send("increment-doc-count");
  }

  //
  // RTDB
  //

  const sandboxDbRef = databaseRef(database, "admin/sandbox");
  const dbObj = /** @type {import("@/models/sandbox").SandboxDB} */ (
    useDatabaseObject(sandboxDbRef)
  );

  function incrementDbObjCount() {
    ws.send("increment-db-obj-count");
  }

  return {
    doc,
    incrementDocCount,

    dbObj,
    incrementDbObjCount,
  };
});
