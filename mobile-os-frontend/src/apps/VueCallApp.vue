<template>
  <div class="w-full h-full bg-neutral-100 dark:bg-slate-900 flex flex-col overflow-hidden transition-colors relative">
    
    <!-- Tab: Keypad -->
    <div v-show="activeTab === 'keypad'" class="flex-1 flex flex-col overflow-hidden">
      <div class="pt-5 px-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
        <h1 class="text-3xl font-bold text-black dark:text-white">Teléfono</h1>
      </div>
      
      <div class="p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
         <input 
            v-model="phoneNumber"
            @input="handlePhoneInput"
            type="tel"
            inputmode="numeric"
            class="w-full text-center text-4xl font-mono bg-transparent text-black dark:text-white focus:outline-none placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
            placeholder="0414-0000000"
         />
      </div>

      <div class="flex-1 overflow-y-auto px-4">
        <!-- Direct Call Option -->
        <div v-if="phoneNumber" @click="startCall(phoneNumber)" class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-200 dark:active:bg-slate-800 cursor-pointer rounded-xl px-2 transition-colors">
          <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md shadow-green-500/20 shrink-0">
             <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </div>
          <div class="flex-1">
             <h3 class="font-semibold text-lg text-black dark:text-white">Llamar a</h3>
             <p class="text-green-500 font-bold text-sm font-mono mt-0.5">{{ phoneNumber }}</p>
          </div>
        </div>

        <!-- Matched Contacts -->
        <div 
          v-for="contact in filteredContacts" 
          :key="contact.id"
          @click="startCall(contact.id)"
          class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer active:bg-gray-200 dark:active:bg-slate-800 rounded-xl px-2 transition-colors mt-1"
        >
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg shadow-inner shrink-0">
            {{ contact.avatar }}
          </div>
          <div class="flex-1 overflow-hidden">
            <h3 class="font-semibold text-lg text-black dark:text-white truncate">{{ contact.name }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-mono mt-0.5">{{ formatPhone(contact.id) }}</p>
          </div>
          <button class="text-green-500 p-2 shrink-0 active:scale-90 transition-transform">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab: Contacts -->
    <div v-show="activeTab === 'contacts'" class="flex-1 flex flex-col overflow-hidden">
      <div class="pt-5 px-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
        <h1 class="text-3xl font-bold text-black dark:text-white">Contactos</h1>
      </div>
      
      <!-- Contact List -->
      <div class="flex-1 overflow-y-auto px-4 py-2">
        <div v-if="contactsStore.list.length === 0" class="text-center text-gray-400 dark:text-gray-500 mt-10">
          No tienes contactos agregados.
        </div>

        <div 
          v-for="contact in contactsStore.list" 
          :key="contact.id"
          @click="startCall(contact.id)"
          class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer active:bg-gray-200 dark:active:bg-slate-800 rounded-xl px-2 transition-colors"
        >
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg shadow-inner shrink-0">
            {{ contact.avatar }}
          </div>
          <div class="flex-1 overflow-hidden">
            <h3 class="font-semibold text-lg text-black dark:text-white truncate">{{ contact.name }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm font-mono mt-0.5">{{ formatPhone(contact.id) }}</p>
          </div>
          <button class="text-green-500 p-2 shrink-0 active:scale-90 transition-transform">
             <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="flex justify-around items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 transition-colors shrink-0 px-2 pb-2">
      <button 
        @click="activeTab = 'keypad'" 
        class="flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors rounded-xl"
        :class="activeTab === 'keypad' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-slate-700'"
      >
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
        <span class="text-[11px] font-semibold">Teclado</span>
      </button>
      <button 
        @click="activeTab = 'contacts'" 
        class="flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors rounded-xl"
        :class="activeTab === 'contacts' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 active:bg-gray-100 dark:active:bg-slate-700'"
      >
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
        <span class="text-[11px] font-semibold">Contactos</span>
      </button>
    </div>
    <!-- Active Call Overlay -->
    <div v-if="callStore.callState !== 'IDLE'" class="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col justify-between items-center py-16 px-6 animate-fade-in text-white">
      <!-- Info superior -->
      <div class="text-center mt-10">
        <div class="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto shadow-2xl border border-gray-600">
           👤
        </div>
        <h2 class="text-3xl font-bold mb-2">{{ callStore.remoteNumber }}</h2>
        <p class="text-gray-400 text-lg">
          {{ callStore.callState === 'CALLING' ? 'Llamando...' : 
             callStore.callState === 'RINGING' ? 'Llamada Entrante' : 
             'En curso' }}
        </p>
      </div>

      <!-- Controles inferiores -->
      <div class="flex gap-10 w-full justify-center mb-10">
        <!-- RINGING: Aceptar / Rechazar -->
        <template v-if="callStore.callState === 'RINGING'">
          <button @click="callStore.rejectCall" class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-red-500/20">
             <svg class="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
          <button @click="callStore.acceptCall" class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-green-500/20 animate-pulse">
             <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        </template>
        
        <!-- CALLING / ACTIVE: Colgar -->
        <template v-else>
          <button @click="callStore.endCall" class="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-red-500/20">
             <svg class="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </button>
        </template>
      </div>

      <audio ref="remoteAudio" autoplay></audio>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useContactsStore } from '../store/contacts'
import { useCallStore } from '../store/call'

const contactsStore = useContactsStore()
const callStore = useCallStore()

const activeTab = ref('keypad')
const phoneNumber = ref('')
const remoteAudio = ref(null)

watch(() => callStore.remoteStream, (newStream) => {
  if (remoteAudio.value && newStream) {
    remoteAudio.value.srcObject = newStream
  }
})

const formatPhone = (val) => {
  if (!val) return ''
  let clean = val.replace(/\D/g, '')
  if (clean.length > 4) {
    return clean.substring(0, 4) + '-' + clean.substring(4)
  }
  return clean
}

const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/\D/g, '')
  if (val.length > 11) {
    val = val.substring(0, 11)
  }
  phoneNumber.value = formatPhone(val)
}

const filteredContacts = computed(() => {
  if (!phoneNumber.value) return []
  return contactsStore.list.filter(contact => {
    const rawNumber = contact.id.replace(/\D/g, '')
    const rawSearch = phoneNumber.value.replace(/\D/g, '')
    const searchVal = phoneNumber.value.toLowerCase()
    return rawNumber.includes(rawSearch) || 
           contact.name.toLowerCase().includes(searchVal) ||
           contact.id.includes(searchVal)
  })
})

const startCall = (targetId) => {
  callStore.startCall(targetId)
}
</script>
