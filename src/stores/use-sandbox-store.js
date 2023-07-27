import { defineStore } from "pinia";
import { useDocument, useDatabaseObject } from "vuefire";
import { doc as firestoreDoc, updateDoc } from "firebase/firestore";
import { ref as databaseRef, set } from "firebase/database";

import { database, firestore } from "@/firebase-config";

export const useSandboxStore = defineStore("sandbox", () => {
  //
  // Firestore
  //

  const sandboxDocRef = firestoreDoc(firestore, "admin/sandbox");
  const doc = /** @type {import("@/models/sandbox").SandboxFS} */ (
    useDocument(sandboxDocRef)
  );

  /**
   * Increment the `count` property on the Firestore sandbox doc if it has
   * initialized.
   *
   * @returns A promise that resolves after the doc has been updated, or
   * immediately if the doc is still pending
   */
  async function incrementDocCount() {
    if (doc.pending.value) return;

    const prevCount = doc.value?.count ?? 0;
    return updateDoc(sandboxDocRef, { count: prevCount + 1 });
  }

  //
  // RTDB
  //

  const sandboxDbRef = databaseRef(database, "admin/sandbox");
  const dbObj = /** @type {import("@/models/sandbox").SandboxDB} */ (
    useDatabaseObject(sandboxDbRef)
  );

  async function incrementDbObjCount() {
    if (dbObj.pending.value) return;

    const prevCount = dbObj.value?.count ?? 0;
    return set(sandboxDbRef, { count: prevCount + 1 });
  }

  return {
    doc,
    incrementDocCount,

    dbObj,
    incrementDbObjCount,
  };
});
