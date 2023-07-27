import { defineStore } from "pinia";
import { useDocument, useDatabaseObject } from "vuefire";
import { updateDoc } from "firebase/firestore";
import { set } from "firebase/database";

import { sandboxDocRef, sandboxRTRef } from "@/firebase-config";

export const useSandbox = defineStore("sandbox", () => {
  const sandboxDoc =
    /** @type {import('vuefire')._RefFirestore<{count: number} | undefined>} */ (
      useDocument(sandboxDocRef)
    );

  async function incrementDocCount() {
    if (sandboxDoc.pending.value) return;

    const prevCount = sandboxDoc.value?.count ?? 0;
    return updateDoc(sandboxDocRef, { count: prevCount + 1 });
  }

  const sandboxRTObject =
    /** @type {import('vuefire')._RefDatabase<{count: number} | undefined>} */ (
      useDatabaseObject(sandboxRTRef)
    );

  async function incrementRTCount() {
    if (sandboxRTObject.pending.value) return;

    const prevCount = sandboxRTObject.value?.count ?? 0;
    return set(sandboxRTRef, { count: prevCount + 1 });
  }

  return {
    sandboxDoc,
    sandboxRTObject,

    incrementDocCount,
    incrementRTCount,
  };
});
