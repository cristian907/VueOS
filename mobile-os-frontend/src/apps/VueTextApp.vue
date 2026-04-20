<template>
  <div class="w-full h-full flex flex-col bg-white dark:bg-slate-900 transition-colors">
    <!-- PANTALLA DE BLOQUEO / CONFIGURACIÓN -->
    <div v-if="!hasNumber" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-black dark:text-white mb-3">Bienvenido a VueText</h2>
      <p class="text-neutral-500 dark:text-slate-400 mb-8">Para usar el servicio de mensajería en la red P2P, debes configurar tu Número Virtual.</p>
      
      <button 
        @click="goToSettings"
        class="bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
      >
        Ir a Ajustes
      </button>
    </div>

    <!-- PANTALLA PRINCIPAL DE CHATS -->
    <div v-else-if="!activeChat" class="flex-1 flex flex-col h-full">
      <div class="pt-5 pb-3 px-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center shrink-0">
        <h1 class="text-3xl font-bold text-black dark:text-white">Mensajes</h1>
        <div class="flex items-center gap-3">
          <!-- Indicador de conexión -->
          <div 
            class="w-3 h-3 rounded-full" 
            :class="network.isRegistered ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'"
          ></div>
          <button @click="startNewChat" class="text-blue-500 active:scale-90 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
        </div>
      </div>

      <!-- Alerta de Error de Red -->
      <div v-if="network.connectionError" class="bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 text-sm text-center">
        {{ network.connectionError }}
      </div>
      <div v-else-if="!network.isConnected" class="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 p-2 text-xs text-center font-medium">
        Conectando a la red...
      </div>

      <!-- Lista de Conversaciones -->
      <div class="flex-1 overflow-y-auto px-5 py-2 space-y-1">
        <div v-if="conversations.length === 0" class="text-center text-neutral-400 mt-10">
          No tienes mensajes.
        </div>
        <div 
          v-for="conv in conversations" 
          :key="conv.number"
          @click="openChat(conv.number)"
          class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0 active:bg-gray-50 dark:active:bg-slate-800/50 -mx-5 px-5 transition-colors cursor-pointer"
        >
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
            {{ conv.number.charAt(0) }}
          </div>
          <div class="flex-1 overflow-hidden">
            <h3 class="font-semibold text-black dark:text-white text-lg truncate">{{ conv.number }}</h3>
            <p class="text-neutral-500 dark:text-slate-400 text-sm truncate">{{ conv.lastMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PANTALLA DE CHAT ACTIVO -->
    <div v-else class="flex-1 flex flex-col h-full bg-neutral-50 dark:bg-slate-900">
      <!-- Header -->
      <div class="pt-5 pb-3 px-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 shrink-0 z-10">
        <button @click="closeChat" class="text-blue-500 flex items-center -ml-2 active:opacity-70 transition-opacity">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div class="flex items-center gap-2 flex-1 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {{ activeChat.charAt(0) }}
          </div>
          <h2 class="font-semibold text-black dark:text-white truncate">{{ activeChat }}</h2>
        </div>
      </div>

      <!-- Mensajes -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" ref="messagesContainer">
        <div 
          v-for="msg in currentMessages" 
          :key="msg.id"
          class="max-w-[80%] rounded-2xl px-4 py-2 flex flex-col"
          :class="msg.sender === settings.phoneNumber ? 'self-end bg-blue-500 text-white rounded-br-sm' : 'self-start bg-gray-200 dark:bg-slate-700 text-black dark:text-white rounded-bl-sm'"
        >
          <span class="text-[15px] leading-snug break-words">{{ msg.text }}</span>
          <span 
            class="text-[10px] mt-1 self-end opacity-70"
          >{{ new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="px-3 pt-3 pb-8 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shrink-0 flex items-end gap-2">
        <div class="flex-1 bg-neutral-100 dark:bg-slate-700 rounded-2xl border border-transparent dark:border-slate-600 focus-within:border-blue-500 overflow-hidden px-4 py-2 flex items-center min-h-[44px]">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendChat"
            type="text" 
            placeholder="Mensaje" 
            class="w-full bg-transparent text-black dark:text-white focus:outline-none"
          />
        </div>
        <button 
          @click="sendChat" 
          :disabled="!newMessage.trim() || !network.isRegistered"
          class="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all"
        >
          <svg class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSettingsStore } from '../store/settings'
import { useKernelStore } from '../store/kernel'
import { useNetworkStore } from '../store/network'
import { db } from '../store/db'
import { liveQuery } from 'dexie'

const settings = useSettingsStore()
const kernel = useKernelStore()
const network = useNetworkStore()

const hasNumber = computed(() => !!settings.phoneNumber)

const goToSettings = () => {
  kernel.openApp({ id: 'settings', name: 'Ajustes', ramRequired: 512, component: 'settings' })
}

// Lógica de Chats
const activeChat = ref(null)
const conversations = ref([])
const currentMessages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

// Extraer lista de conversaciones únicas
const loadConversations = async () => {
  const allMsgs = await db.messages.reverse().toArray()
  const convMap = new Map()
  
  for (const msg of allMsgs) {
    if (!convMap.has(msg.chatWith)) {
      convMap.set(msg.chatWith, {
        number: msg.chatWith,
        lastMessage: msg.text,
        date: msg.date
      })
    }
  }
  conversations.value = Array.from(convMap.values())
}

// Observers para IndexedDB
let messagesSubscription = null
let convSubscription = null

onMounted(() => {
  // Observar conversaciones en vivo
  convSubscription = liveQuery(() => db.messages.orderBy('date').reverse().toArray()).subscribe(allMsgs => {
    const convMap = new Map()
    for (const msg of allMsgs) {
      if (!convMap.has(msg.chatWith)) {
        convMap.set(msg.chatWith, {
          number: msg.chatWith,
          lastMessage: msg.text,
          date: msg.date
        })
      }
    }
    conversations.value = Array.from(convMap.values())
  })
})

const startNewChat = () => {
  const target = prompt('Ingresa el Número Virtual de la persona:')
  if (target && target.trim()) {
    openChat(target.trim())
  }
}

const openChat = (number) => {
  activeChat.value = number
  
  // Suscribirnos a los mensajes de este chat específico y ordenarlos en memoria por seguridad
  if (messagesSubscription) messagesSubscription.unsubscribe()
  
  messagesSubscription = liveQuery(
    async () => {
      const msgs = await db.messages.where('chatWith').equals(number).toArray()
      return msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  ).subscribe(msgs => {
    currentMessages.value = msgs
    scrollToBottom()
  })
}

const closeChat = () => {
  activeChat.value = null
  if (messagesSubscription) {
    messagesSubscription.unsubscribe()
    messagesSubscription = null
  }
}

const sendChat = async () => {
  const text = newMessage.value.trim()
  if (!text) return
  
  newMessage.value = ''
  
  try {
    await network.sendMessage(activeChat.value, text)
  } catch (err) {
    console.error(err)
    alert('No se pudo enviar el mensaje: ' + err.message)
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 50)
}
</script>
