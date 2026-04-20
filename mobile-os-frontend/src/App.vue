<template>
  <div :class="settingsStore.theme === 'dark' ? 'dark' : ''" class="h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-0 sm:p-8 transition-colors overflow-hidden">
    
    <!-- Mobile Device Container -->
    <div 
      class="relative w-full h-[100dvh] sm:w-[375px] sm:h-[812px] sm:rounded-[40px] overflow-hidden flex flex-col bg-white dark:bg-slate-900 shadow-2xl sm:ring-8 ring-slate-200 dark:ring-slate-800 transition-all font-sans"
    >
      <!-- Wallpaper Background -->
      <div class="absolute inset-0 z-0">
        <div v-if="settingsStore.theme === 'dark'" class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90 blur-sm mix-blend-overlay"></div>
        <div v-else class="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 opacity-90 blur-sm"></div>
        
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div class="absolute top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>


      <!-- OS Status Bar -->
      <StatusBar class="relative z-50" />

      <!-- Main Desktop Area -->
      <DesktopLayer />

      <!-- Temporal Multitask Button (Dock Item) -->
      <button 
        @click="showMultitaskWrapper = true"
        class="absolute bottom-8 right-4 z-20 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
      </button>

      <!-- APPS & MULTITASK LAYER (Gestor de Ventanas) -->
      <WindowManager 
        :showMultitask="showMultitaskWrapper" 
        @toggleMultitask="val => showMultitaskWrapper = val"
      />

      <!-- Dock / Bottom Area (Home Button/Indicator) -->
      <HomeIndicator 
        @toggleMultitask="val => showMultitaskWrapper = val"
      />

      <!-- LockScreen (capa superior a todo) -->
      <LockScreen v-if="settingsStore.isLocked" />

      <!-- CallOverlay (capa superior absoluta para llamadas) -->
      <CallOverlay />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from './store/settings'

// Import Shell Components
import StatusBar from './components/StatusBar.vue'
import DesktopLayer from './components/os/Desktop.vue'
import WindowManager from './components/os/WindowManager.vue'
import HomeIndicator from './components/os/HomeIndicator.vue'
import LockScreen from './components/os/LockScreen.vue'
import CallOverlay from './components/os/CallOverlay.vue'

const settingsStore = useSettingsStore()

// El estado de la vista de Multitarea ahora vive aquí para distribuir a los hijos
const showMultitaskWrapper = ref(false)
</script>

<style>
/* Custom animations for the wallpaper background */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fade-in {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(24px); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}

/* Hide scrollbar for multitask */
::-webkit-scrollbar {
  display: none;
}
</style>
