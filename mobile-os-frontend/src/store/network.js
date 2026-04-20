import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSettingsStore } from './settings'
import { db } from './db'

export const useNetworkStore = defineStore('network', () => {
  const settingsStore = useSettingsStore()
  
  const isConnected = ref(false)
  const isRegistered = ref(false)
  const connectionError = ref('')
  
  let socket = null

  // Inicializa la conexión
  const connect = () => {
    if (socket) {
      socket.close()
    }
    
    socket = new WebSocket('ws://localhost:8080/ws')

    socket.onopen = () => {
      console.log('[Network] WebSocket conectado.')
      isConnected.value = true
      
      // Si tenemos un número configurado, intentar registrar
      if (settingsStore.phoneNumber) {
        register(settingsStore.phoneNumber)
      }
    }

    socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data)
        
        if (msg.type === 'register_success') {
          console.log('[Network] Registro P2P exitoso.')
          isRegistered.value = true
          connectionError.value = ''
        } 
        else if (msg.type === 'error') {
          console.error('[Network] Error del servidor:', msg.payload)
          connectionError.value = msg.payload
          isRegistered.value = false
          // Borrar el número inválido/duplicado de settings
          settingsStore.setPhoneNumber('')
        }
        else if (msg.type === 'chat') {
          console.log(`[Network] Mensaje recibido de ${msg.senderNumber}`)
          // Guardar en la BD local
          await db.messages.add({
            chatWith: msg.senderNumber, // Agruparemos la conversación por quien envía
            sender: msg.senderNumber,
            text: msg.payload,
            date: msg.timestamp || new Date().toISOString()
          })
        }
      } catch (e) {
        console.error('[Network] Fallo al parsear mensaje:', e)
      }
    }

    socket.onclose = () => {
      console.log('[Network] WebSocket desconectado.')
      isConnected.value = false
      isRegistered.value = false
      // Intentar reconectar en 5 segundos si sigue siendo necesario
      setTimeout(() => {
        if (settingsStore.phoneNumber) connect()
      }, 5000)
    }
    
    socket.onerror = (error) => {
      console.error('[Network] Error de WebSocket:', error)
      isConnected.value = false
    }
  }

  const register = (number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'register',
        senderNumber: number
      }))
    }
  }

  const sendMessage = async (targetNumber, text) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !isRegistered.value) {
      throw new Error('No hay conexión a la red P2P.')
    }
    
    const msgData = {
      type: 'chat',
      senderNumber: settingsStore.phoneNumber,
      targetNumber: targetNumber,
      payload: text,
      timestamp: new Date().toISOString()
    }

    // Enviar al server
    socket.send(JSON.stringify(msgData))

    // Guardar en nuestra base de datos local (como enviado)
    await db.messages.add({
      chatWith: targetNumber, // Agruparemos por el destinatario
      sender: settingsStore.phoneNumber,
      text: text,
      date: msgData.timestamp
    })
  }

  // Si el número de configuración cambia, forzar registro (o reconexión)
  watch(() => settingsStore.phoneNumber, (newNumber) => {
    if (newNumber) {
      if (!isConnected.value) {
        connect()
      } else {
        register(newNumber)
      }
    } else {
      isRegistered.value = false
      if (socket) socket.close()
    }
  }, { immediate: true })

  return {
    isConnected,
    isRegistered,
    connectionError,
    sendMessage
  }
})
