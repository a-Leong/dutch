import { defineStore } from "pinia";
import { useDocument, useDatabaseObject } from "vuefire";
import { updateDoc } from "firebase/firestore";
import { set } from "firebase/database";

import { sandboxDocRef, sandboxRTRef } from "@/firebase-config";

export const useSandboxStore = defineStore("sandbox", () => {
  //
  // Firestore
  //

  const doc = /** @type {import("@/models/sandbox").SandboxFS} */ (
    useDocument(sandboxDocRef)
  );

  async function incrementDocCount() {
    if (doc.pending.value) return;

    const prevCount = doc.value?.count ?? 0;
    return updateDoc(sandboxDocRef, { count: prevCount + 1 });
  }

  //
  // RTDB
  //

  const dbObj = /** @type {import("@/models/sandbox").SandboxDB} */ (
    useDatabaseObject(sandboxRTRef)
  );

  async function incrementDbObjCount() {
    if (dbObj.pending.value) return;

    const prevCount = dbObj.value?.count ?? 0;
    return set(sandboxRTRef, { count: prevCount + 1 });
  }

  return {
    doc,
    incrementDocCount,

    dbObj,
    incrementDbObjCount,
  };
});
