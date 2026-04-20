<template>
  <div v-if="callStore.callState !== 'IDLE'" class="absolute inset-0 z-[100] flex flex-col justify-between items-center py-16 px-6 animate-fade-in text-white overflow-hidden"
       :class="callStore.isVideoCall && callStore.callState === 'ACTIVE' ? 'bg-black/30' : 'bg-black/80 backdrop-blur-xl'">
    
    <!-- Videos (sólo en videollamada activa) -->
    <template v-if="callStore.isVideoCall">
      <video ref="remoteVideo" autoplay playsinline class="absolute inset-0 w-full h-full object-cover z-0"></video>
      <video ref="localVideo" autoplay playsinline muted class="absolute top-16 right-4 w-24 h-40 object-cover rounded-2xl shadow-2xl z-10 border border-white/20 bg-gray-900"></video>
    </template>

    <!-- Info superior -->
    <div class="text-center mt-10 z-20">
      <div class="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto shadow-2xl border border-gray-600">
         {{ remoteContact ? remoteContact.avatar : '👤' }}
      </div>
      <h2 v-if="remoteContact" class="text-3xl font-bold mb-1">{{ remoteContact.name }}</h2>
      <p v-if="remoteContact" class="text-xl font-mono text-gray-300">{{ formatPhone(callStore.remoteNumber) }}</p>
      <h2 v-else class="text-3xl font-bold font-mono mb-2">{{ formatPhone(callStore.remoteNumber) }}</h2>
      <p class="text-gray-400 text-lg mt-2">
        <span v-if="callStore.callState === 'ACTIVE'" class="text-green-400 font-mono">{{ formattedDuration }}</span>
        <span v-else-if="callStore.callState === 'CALLING'">Llamando...</span>
        <span v-else-if="callStore.callState === 'RINGING'">Llamada Entrante</span>
        <span v-else>En curso</span>
      </p>
    </div>

    <!-- Controles inferiores -->
    <div class="flex gap-10 w-full justify-center mb-10 z-20">
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
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useCallStore } from '../../store/call'
import { useContactsStore } from '../../store/contacts'

const callStore = useCallStore()
const contactsStore = useContactsStore()

const remoteAudio = ref(null)
const remoteVideo = ref(null)
const localVideo = ref(null)

watchEffect(() => {
  if (remoteAudio.value && callStore.remoteStream && !callStore.isVideoCall) {
    remoteAudio.value.srcObject = callStore.remoteStream
  }
  if (remoteVideo.value && callStore.remoteStream && callStore.isVideoCall) {
    remoteVideo.value.srcObject = callStore.remoteStream
  }
  if (localVideo.value && callStore.localStream && callStore.isVideoCall) {
    localVideo.value.srcObject = callStore.localStream
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

const formattedDuration = computed(() => {
  const m = Math.floor(callStore.callDuration / 60).toString().padStart(2, '0')
  const s = (callStore.callDuration % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const remoteContact = computed(() => {
  if (!callStore.remoteNumber) return null
  const cleanRemote = callStore.remoteNumber.replace(/\D/g, '')
  return contactsStore.list.find(c => c.id.replace(/\D/g, '') === cleanRemote)
})
</script>
