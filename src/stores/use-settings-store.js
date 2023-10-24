import { reactive, toRefs } from "vue";
import { defineStore } from "pinia";

export const useSettingsStore = defineStore("app-settings", () => {
  const settings = reactive({ audioEnabled: true });

  function setAudioEnabled(enabled) {
    settings.audioEnabled = enabled;
  }

  return {
    ...toRefs(settings),

    setAudioEnabled,
  };
});
