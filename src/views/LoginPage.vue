<script setup>
import { auth } from "@/firebase-config";
import router from "@/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref } from "vue";

// Sign Up

const signUpEmailInput = ref("");
const signUpPasswordInput = ref("");
const signUpError = ref();
async function signUp() {
  try {
    const user = await createUserWithEmailAndPassword(
      auth,
      signUpEmailInput.value,
      signUpPasswordInput.value
    );

    console.log("Created user", user);

    router.push({ name: "PlayPage" });
  } catch (error) {
    signUpError.value = error;
  }
}

// Sign In

const signInEmailInput = ref("");
const signInPasswordInput = ref("");
const signInError = ref();
async function signIn() {
  try {
    const user = await signInWithEmailAndPassword(
      auth,
      signInEmailInput.value,
      signInPasswordInput.value
    );

    console.log("Signed in user", user);
  } catch (error) {
    signInError.value = error;
  }
}
</script>

<template>
  <div>
    <label>email: </label>
    <input v-model="signUpEmailInput" type="email" />

    <label>password: </label>
    <input v-model="signUpPasswordInput" type="password" />

    <button @click="signUp">sign up</button>

    <pre class="error">{{ signUpError }}</pre>
  </div>

  <div>
    <label>email: </label>
    <input v-model="signInEmailInput" type="email" />

    <label>password: </label>
    <input v-model="signInPasswordInput" type="password" />

    <button @click="signIn">sign in</button>

    <pre class="error">{{ signInError }}</pre>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
