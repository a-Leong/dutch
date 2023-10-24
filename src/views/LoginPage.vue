<script setup>
import { auth } from "@/firebase-config";
import router from "@/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref } from "vue";

import AppAudioEnabledButton from "@/components/AppAudioEnabledButton.vue";
import AppFlipCard from "@/components/AppFlipCard.vue";

import jackSvg from "@/assets/svg/Jack_of_spades_fr.svg";
import queenSvg from "@/assets/svg/Queen_of_hearts_fr.svg";

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
    signUpError.value = error.message;
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
    signInError.value = error.message;
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
            <input v-model="signUpEmailInput" type="email" @click.stop />
          </div>

          <div>
            <label>password: </label>
            <input
              v-model="signUpPasswordInput"
              type="password"
              @keydown.enter="signUp"
              @click.stop
            />
          </div>

          <button @click.stop="signUp">go</button>

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
            <input v-model="signInEmailInput" type="email" @click.stop />
          </div>

          <div>
            <label>password: </label>
            <input
              v-model="signInPasswordInput"
              type="password"
              @keydown.enter="signIn"
              @click.stop
            />
          </div>

          <button @click.stop="signIn">go</button>

          <p v-if="signInError" class="error">{{ signInError }}</p>
        </div>
      </template>
    </app-flip-card>

    <app-audio-enabled-button class="toggle-audio-button" />
  </div>
</template>

<style scoped>
input {
  width: 120px;
}

.toggle-audio-button {
  z-index: 200;
  position: absolute;
  right: 0;
  bottom: 0;
}

.card {
  margin: 40px 8px;
}

.error {
  color: red;
}

.login-form {
  display: flex;
  flex-flow: column;
  align-items: end;
  gap: 4px;
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
