import { readonly, ref, toRaw } from "vue";
import { defineStore } from "pinia";
// import { useDocument, useDatabaseObject } from "vuefire";
// import { doc as firestoreDoc } from "firebase/firestore";
// import { ref as databaseRef } from "firebase/database";

// import { database, firestore } from "@/firebase-config";

import { useSocketStore } from "@/stores/use-socket-store";

export const useGameStore = defineStore("game-state", () => {
  const { sendCommand } = useSocketStore();

  const gameState = ref();

  function init() {
    sendCommand({ id: "init" });
  }

  function incrementDocCount() {
    sendCommand({ id: "increment-doc-count" });
  }

  function incrementDbObjCount() {
    sendCommand({ id: "increment-db-obj-count" });
  }

  function setGameState(newState) {
    gameState.value = toRaw(newState);
  }

  //
  // Firestore
  //

  // const sandboxDocRef = firestoreDoc(firestore, "admin/sandbox");
  // const doc = /** @type {import("@/models/sandbox").SandboxFS} */ (
  //   useDocument(sandboxDocRef)
  // );

  //
  // RTDB
  //

  // const sandboxDbRef = databaseRef(database, "admin/sandbox");
  // const dbObj = /** @type {import("@/models/sandbox").SandboxDB} */ (
  //   useDatabaseObject(sandboxDbRef)
  // );

  return {
    gameState,

    init,
    incrementDocCount,
    incrementDbObjCount,
    setGameState,
  };
});
