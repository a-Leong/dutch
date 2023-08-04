import { reactive, readonly, toRaw } from "vue";
import { defineStore } from "pinia";
// import { useDocument, useDatabaseObject } from "vuefire";
// import { doc as firestoreDoc } from "firebase/firestore";
// import { ref as databaseRef } from "firebase/database";

// import { database, firestore } from "@/firebase-config";

export const useGameStore = defineStore("game-state", () => {
  /**
   * @typedef {import('@/models/game-state').ClientState} ClientState
   * @type {Partial<ClientState>}
   */
  const game = reactive({});

  /**
   * @param {import('@/models/game-state').ClientState} newState
   */
  function set(newState) {
    Object.assign(game, toRaw(newState));
  }

  function deinit() {
    Object.assign(game, {});
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
    game: readonly(game),

    deinit,
    set,
  };
});
