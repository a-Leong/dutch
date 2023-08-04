<script setup>
import { RouterView } from "vue-router";
import { ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";

import router from "@/router";
import { auth } from "@/firebase-config";

import AppLoadingPage from "@/components/AppLoadingPage.vue";

import { wait } from "@/utils/wait";

const isLoading = ref(true);

onAuthStateChanged(auth, async (user) => {
  await router.isReady();

  if (user) {
    await router.push({ name: "PlayPage" });
  } else {
    await router.push({ name: "LoginPage" });
  }

  await wait(0); // Add delay to increase loading page duration
  isLoading.value = false;
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <app-loading-page v-if="isLoading" />
      <component :is="Component" v-else />
    </transition>
  </router-view>
</template>

<style>
/* App Global Styles */

pre {
  /* Debug */
  white-space: pre-wrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
