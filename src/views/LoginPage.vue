<script setup>
import { auth } from "@/firebase-config";
import router from "@/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref } from "vue";

import AppFlipCard from "@/components/AppFlipCard.vue";

import jackSvg from "@/assets/Jack_of_spades_fr.svg";
import queenSvg from "@/assets/Queen_of_hearts_fr.svg";

// Sign Up

const signUpEmailInput = ref("");
const signUpPasswordInput = ref("");
const signUpError = ref();
async function signUp() {
  signUpError.value = undefined;

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
  signInError.value = undefined;

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
  <div class="login-page">
    <app-flip-card class="card">
      <template #front>
        <img
          :src="queenSvg"
          style="height: 100%; width: 100%"
          :draggable="false"
        />
      </template>
      <template #back>
        <div class="login-form">
          <b>sign up</b>

          <div>
            <label>email: </label>
            <input
              v-model="signUpEmailInput"
              type="email"
              @click="$event.stopPropagation()"
            />
          </div>

          <div>
            <label>password: </label>
            <input
              v-model="signUpPasswordInput"
              type="password"
              @keydown.enter="signUp"
              @click="$event.stopPropagation()"
            />
          </div>

          <button @click="$event.stopPropagation(), signUp()">go</button>

          <p v-if="signUpError" class="error">{{ signUpError }}</p>
        </div>
      </template>
    </app-flip-card>

    <app-flip-card class="card">
      <template #front>
        <img
          :src="jackSvg"
          style="height: 100%; width: 100%"
          :draggable="false"
        />
      </template>
      <template #back>
        <div class="login-form">
          <b>sign in</b>

          <div>
            <label>email: </label>
            <input
              v-model="signInEmailInput"
              type="email"
              @click="$event.stopPropagation()"
            />
          </div>

          <div>
            <label>password: </label>
            <input
              v-model="signInPasswordInput"
              type="password"
              @keydown.enter="signIn"
              @click="$event.stopPropagation()"
            />
          </div>

          <button @click="$event.stopPropagation(), signIn()">go</button>

          <p v-if="signInError" class="error">{{ signInError }}</p>
        </div>
      </template>
    </app-flip-card>
  </div>
</template>

<style scoped>
input {
  width: 120px;
}

.card {
  margin: 40px 4px;
}

.error {
  color: red;
}

.login-form {
  display: flex;
  flex-flow: column;
  align-items: end;
  margin: 4px;
}

.login-page {
  height: 100%;
  width: 100%;

  display: flex;
  flex-flow: row wrap;
  align-content: end;
  justify-content: center;
}
</style>
