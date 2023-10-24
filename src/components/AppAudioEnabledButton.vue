<script setup>
import { useSettingsStore } from "@/stores/use-settings-store";

const settingsStore = useSettingsStore();
</script>

<template>
  <button
    :title="settingsStore.audioEnabled ? 'AUDIO ON' : 'AUDIO OFF'"
    @click="settingsStore.setAudioEnabled(!settingsStore.audioEnabled)"
  >
    <!-- https://api.iconify.design/streamline:entertainment-volume-level-off-volume-speaker-control-music-audio.svg -->
    <svg
      v-if="settingsStore.audioEnabled"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-4.5 -4.2 20 20"
    >
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 5H1.5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1H3Zm0 4l3.91 2.81a1 1 0 0 0 1 .08A1 1 0 0 0 8.5 11V3a1 1 0 0 0-.5-.89a1 1 0 0 0-1 .08L3 5"
      />
    </svg>

    <!-- https://api.iconify.design/streamline:entertainment-volume-off-speaker-music-mute-volume-control-audio-off-mute.svg -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="-3 -4.2 20 20">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m.5 13.5l13-13M4.5 5H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1.5ZM10 4V3a1 1 0 0 0-.55-.89a1 1 0 0 0-1 .08L4.5 5m2.17 5.56l1.74 1.25a1 1 0 0 0 1 .08A1 1 0 0 0 10 11V7M4.5 9l.29.21"
      />
    </svg>
  </button>
</template>

<style scoped>
button {
  background-color: transparent;
  height: 32px;
  width: 32px;
  padding: 0;
  margin: 2px;

  border: none;
}

svg {
  height: 24px;
  width: 24px;
}
</style>
