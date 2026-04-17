<template>
  <div class="w-full h-full bg-neutral-100 dark:bg-slate-900 flex flex-col overflow-hidden transition-colors">
    <!-- Header -->
    <div class="bg-neutral-100 dark:bg-slate-900 pt-4 pb-2 px-5 flex-shrink-0 transition-colors">
      <div v-if="activeSection" class="flex items-center gap-2 mb-2">
        <button @click="activeSection = null" class="text-blue-500 text-sm font-medium flex items-center gap-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          Ajustes
        </button>
      </div>
      <h1 class="text-3xl font-bold text-black dark:text-white">{{ activeSection ? sectionTitle : 'Ajustes' }}</h1>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-5 pb-8">

      <!-- === MENÚ PRINCIPAL === -->
      <div v-if="!activeSection" class="space-y-6 mt-4">
        
        <!-- Grupo: Seguridad -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <button @click="activeSection = 'security'" class="w-full flex items-center gap-4 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-slate-700 transition-colors">
            <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <span class="text-black dark:text-white text-base font-normal flex-1 text-left">Seguridad</span>
            <svg class="w-5 h-5 text-neutral-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <!-- Grupo: Pantalla (Nuevo) -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <button @click="activeSection = 'display'" class="w-full flex items-center gap-4 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-slate-700 transition-colors">
            <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </div>
            <span class="text-black dark:text-white text-base font-normal flex-1 text-left">Pantalla y Brillo</span>
            <svg class="w-5 h-5 text-neutral-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <!-- Grupo: Red -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <button @click="activeSection = 'network'" class="w-full flex items-center gap-4 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-slate-700 transition-colors">
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <span class="text-black dark:text-white text-base font-normal flex-1 text-left">Red y Número Virtual</span>
            <svg class="w-5 h-5 text-neutral-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <!-- Grupo: Info del Sistema -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div class="px-4 py-3.5">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 bg-neutral-500 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="flex-1">
                <span class="text-black dark:text-white text-base">Acerca de</span>
                <p class="text-neutral-400 dark:text-slate-400 text-xs mt-0.5">VueOS v1.0 — Simulador de SO Móvil</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- === SECCIÓN: PANTALLA === -->
      <div v-if="activeSection === 'display'" class="space-y-6 mt-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm px-4 py-5 space-y-4 transition-colors">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Aspecto</h3>
          
          <div class="flex justify-between items-center py-2">
            <span class="text-black dark:text-white text-base">Modo Oscuro</span>
            
            <!-- Toggle Button -->
            <button 
              @click="handleToggleTheme"
              class="w-12 h-7 rounded-full transition-colors relative"
              :class="settingsStore.theme === 'dark' ? 'bg-green-500' : 'bg-neutral-300 dark:bg-slate-600'"
            >
              <div 
                class="absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform"
                :class="settingsStore.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'"
              ></div>
            </button>
          </div>
          <p class="text-xs text-neutral-500">Alterna entre la apariencia clara y oscura del sistema.</p>
        </div>
      </div>

      <!-- === SECCIÓN: SEGURIDAD === -->
      <div v-if="activeSection === 'security'" class="space-y-6 mt-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm px-4 py-5 space-y-4 transition-colors">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-slate-400 uppercase tracking-wider">Cambiar PIN de Bloqueo</h3>
          
          <!-- Mensaje de Feedback -->
          <div v-if="pinFeedback" :class="pinFeedbackSuccess ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400'" class="p-3 rounded-xl text-sm font-medium border flex items-center gap-2">
            <svg v-if="pinFeedbackSuccess" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ pinFeedback }}
          </div>

          <div>
            <label class="text-sm text-neutral-500 dark:text-slate-400 block mb-1">PIN Actual</label>
            <input 
              v-model="oldPin" 
              type="password" 
              maxlength="4" 
              inputmode="numeric"
              placeholder="••••"
              class="w-full bg-neutral-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-black dark:text-white text-lg tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-neutral-300 dark:placeholder-slate-500"
            />
          </div>
          <div>
            <label class="text-sm text-neutral-500 dark:text-slate-400 block mb-1">Nuevo PIN</label>
            <input 
              v-model="newPin" 
              type="password" 
              maxlength="4" 
              inputmode="numeric"
              placeholder="••••"
              class="w-full bg-neutral-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-black dark:text-white text-lg tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-neutral-300 dark:placeholder-slate-500"
            />
          </div>
          <div>
            <label class="text-sm text-neutral-500 dark:text-slate-400 block mb-1">Confirmar Nuevo PIN</label>
            <input 
              v-model="confirmPin" 
              type="password" 
              maxlength="4" 
              inputmode="numeric"
              placeholder="••••"
              class="w-full bg-neutral-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-black dark:text-white text-lg tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-neutral-300 dark:placeholder-slate-500"
            />
          </div>
          <button 
            @click="handleChangePin" 
            class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-base active:scale-[0.98] transition-transform hover:bg-blue-600"
          >
            Guardar PIN
          </button>
        </div>

        <!-- Botón Bloquear Pantalla -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <button @click="handleLock" class="w-full flex items-center gap-4 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-slate-700 transition-colors">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <span class="text-black dark:text-white text-base font-normal">Bloquear Pantalla</span>
          </button>
        </div>
      </div>

      <!-- === SECCIÓN: RED === -->
      <div v-if="activeSection === 'network'" class="space-y-6 mt-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm px-4 py-5 space-y-4 transition-colors">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-slate-400 uppercase tracking-wider">Número de Teléfono Ficticio</h3>
          <p class="text-sm text-neutral-500 dark:text-slate-400">Este número identificará tu dispositivo en la red P2P para llamadas y mensajes.</p>
          
          <!-- Feedback -->
          <div v-if="phoneFeedback" class="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            {{ phoneFeedback }}
          </div>

          <div>
            <label class="text-sm text-neutral-500 dark:text-slate-400 block mb-1">Número Virtual</label>
            <input 
              v-model="phoneInput" 
              type="tel" 
              maxlength="15"
              placeholder="Ej: 0414-123-4567"
              class="w-full bg-neutral-100 dark:bg-slate-700 rounded-xl px-4 py-3 text-black dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-neutral-300 dark:placeholder-slate-500"
            />
          </div>
          <button 
            @click="handleSavePhone" 
            class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold text-base active:scale-[0.98] transition-transform hover:bg-blue-600"
          >
            Guardar Número
          </button>
        </div>

        <!-- Info actual -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm px-4 py-3.5 transition-colors">
          <div class="flex justify-between items-center">
            <span class="text-neutral-500 dark:text-slate-400 text-sm">Número actual</span>
            <span class="text-black dark:text-white text-sm font-mono">{{ settingsStore.phoneNumber || 'No configurado' }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../store/settings'

const settingsStore = useSettingsStore()

// --- Navegación interna ---
const activeSection = ref(null)
const sectionTitle = computed(() => {
  switch(activeSection.value) {
    case 'security': return 'Seguridad'
    case 'network': return 'Red y Número Virtual'
    case 'display': return 'Pantalla'
    default: return ''
  }
})

// --- Seguridad (PIN) ---
const oldPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const pinFeedback = ref('')
const pinFeedbackSuccess = ref(false)

const handleChangePin = () => {
  const result = settingsStore.changePin(oldPin.value, newPin.value, confirmPin.value)
  pinFeedback.value = result.success ? '¡PIN actualizado correctamente!' : result.error
  pinFeedbackSuccess.value = result.success
  if (result.success) {
    oldPin.value = ''
    newPin.value = ''
    confirmPin.value = ''
  }
}

const handleLock = () => {
  settingsStore.lock()
}

// --- Pantalla (Tema) ---
const handleToggleTheme = () => {
  const newTheme = settingsStore.theme === 'dark' ? 'light' : 'dark'
  settingsStore.toggleTheme(newTheme)
}

// --- Red (Número Virtual) ---
const phoneInput = ref(settingsStore.phoneNumber)
const phoneFeedback = ref('')

const handleSavePhone = () => {
  if (!phoneInput.value.trim()) {
    phoneFeedback.value = ''
    return
  }
  settingsStore.setPhoneNumber(phoneInput.value.trim())
  phoneFeedback.value = 'Número guardado correctamente.'
  setTimeout(() => { phoneFeedback.value = '' }, 3000)
}
</script>
