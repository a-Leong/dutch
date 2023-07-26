import { defineStore } from "pinia";
import { useDocument } from "vuefire";
import { updateDoc } from "firebase/firestore";

import { sandboxDocRef } from "@/firebase-config";

export const useSandboxDoc = defineStore("sandbox-doc", () => {
  const sandboxDoc =
    /** @type {import('vuefire')._RefFirestore<{count: number} | undefined>} */ (
      useDocument(sandboxDocRef)
    );

  async function incrementCount() {
    if (sandboxDoc.pending.value) return;

    const prevCount = sandboxDoc.value?.count ?? 0;
    return updateDoc(sandboxDocRef, { count: prevCount + 1 });
  }

  return {
    sandboxDoc,
    incrementCount,
  };
});
