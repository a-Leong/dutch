import { reactive, readonly } from "@vue/reactivity";

import { database, firestore } from "../firebase-admin-config.js";

const debug = false;

const gameState = reactive({
  doc: { count: 0 },
  dbObj: { count: 0 },
});

export default function () {
  async function init() {
    const docSnapshot = await firestore.doc("admin/sandbox").get();
    const dbObjSnapshot = await database.ref("admin/sandbox").get();

    gameState.doc = /** @type {{count: number}} */ (docSnapshot.data());
    gameState.dbObj = dbObjSnapshot.val();
  }

  async function incrementDocCount() {
    gameState.doc.count++;
    return firestore
      .doc("admin/sandbox")
      .update({ count: gameState.doc.count });
  }

  async function incrementdbOjbCount() {
    gameState.dbObj.count++;
    return database
      .ref("admin/sandbox")
      .update({ count: gameState.dbObj.count });
  }

  return {
    gameState: readonly(gameState),

    init,
    incrementdbOjbCount,
    incrementDocCount,
  };
}
