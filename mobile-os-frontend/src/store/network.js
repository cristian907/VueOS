import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from './settings'
import { db } from './db'
import { useCallStore } from './call'

export const useNetworkStore = defineStore('network', () => {
  const settingsStore = useSettingsStore()

  const isConnected = ref(false)
  const isRegistered = ref(false)
  const connectionError = ref('')
  const unreadCounts = ref({}) // { phoneNumber: count }

  let socket = null
  let reconnectTimer = null // Un único timer global para evitar duplicados

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const scheduleReconnect = () => {
    clearReconnectTimer()
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (settingsStore.phoneNumber) {
        connect()
      }
    }, 5000)
  }

  // Cierra el socket actual sin activar la reconexión automática
  const closeSocket = () => {
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
      socket = null
    }
  }

  const connect = () => {
    clearReconnectTimer()
    closeSocket() // Limpiar siempre antes de crear una nueva conexión

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = window.location.host
    const wsUrl = `${wsProtocol}//${wsHost}/ws`
    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('[Network] WebSocket conectado.')
      isConnected.value = true
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
          // El servidor rechazó el número: limpiar sin cerrar el socket
          settingsStore.setPhoneNumber('')
        }
        else if (msg.type === 'chat') {
          let text = msg.payload
          let imageBase64 = null
          if (typeof msg.payload === 'object' && msg.payload !== null) {
             text = msg.payload.text || ''
             imageBase64 = msg.payload.image || null
          }
          
          let blob = null
          if (imageBase64) {
             try {
               const res = await fetch(imageBase64)
               blob = await res.blob()
               // Guardar en Galería
               await db.photos.add({
                 date: msg.timestamp || new Date().toISOString(),
                 blob: blob
               })
             } catch (err) {
               console.error('[Network] Error parseando imagen recibida:', err)
             }
          }

          await db.messages.add({
            chatWith: msg.senderNumber,
            sender: msg.senderNumber,
            text: text,
            blob: blob,
            date: msg.timestamp || new Date().toISOString()
          })

          // Notificaciones: incrementar contador si no es señal
          unreadCounts.value[msg.senderNumber] = (unreadCounts.value[msg.senderNumber] || 0) + 1
        }
        else if (msg.type === 'signal') {
          const callStore = useCallStore()
          callStore.handleIncomingSignal(msg.senderNumber, msg.payload)
        }
      } catch (e) {
        console.error('[Network] Fallo al parsear mensaje:', e)
      }
    }

    socket.onclose = (event) => {
      console.log('[Network] WebSocket desconectado, código:', event.code)
      isConnected.value = false
      isRegistered.value = false
      // Reconectar solo si hay un número configurado
      if (settingsStore.phoneNumber) {
        scheduleReconnect()
      }
    }

    socket.onerror = () => {
      // onerror siempre va seguido de onclose, así que no hacemos nada extra
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

  const deregister = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'deregister' }))
    }
  }

  const sendMessage = async (targetNumber, text, imageBase64 = null) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !isRegistered.value) {
      throw new Error('No hay conexión a la red P2P.')
    }

    const msgData = {
      type: 'chat',
      senderNumber: settingsStore.phoneNumber,
      targetNumber: targetNumber,
      payload: { text, image: imageBase64 },
      timestamp: new Date().toISOString()
    }

    socket.send(JSON.stringify(msgData))

    let blob = null
    if (imageBase64) {
      try {
        const res = await fetch(imageBase64)
        blob = await res.blob()
        await db.photos.add({
          date: msgData.timestamp,
          blob: blob
        })
      } catch (err) {
        console.error('[Network] Error parseando imagen enviada:', err)
      }
    }

    await db.messages.add({
      chatWith: targetNumber,
      sender: settingsStore.phoneNumber,
      text: text,
      blob: blob,
      date: msgData.timestamp
    })
  }

  const sendSignal = (targetNumber, payload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !isRegistered.value) {
      console.warn('[Network] No se puede enviar señal, sin conexión P2P.')
      return
    }
    socket.send(JSON.stringify({
      type: 'signal',
      senderNumber: settingsStore.phoneNumber,
      targetNumber: targetNumber,
      payload: payload,
      timestamp: new Date().toISOString()
    }))
  }

  // Watcher: reacciona a cambios en el número configurado
  watch(() => settingsStore.phoneNumber, (newNumber, oldNumber) => {
    if (newNumber) {
      if (!isConnected.value) {
        // No hay conexión: crear una nueva
        connect()
      } else if (newNumber !== oldNumber) {
        // Cambio de número: liberar el anterior y pedir el nuevo en el mismo socket
        if (oldNumber) deregister()
        isRegistered.value = false
        register(newNumber)
      } else {
        // Mismo número, posiblemente perdimos sesión: re-registrar
        isRegistered.value = false
        register(newNumber)
      }
    } else {
      // Sin número: liberar en servidor, cancelar reconexión automática
      clearReconnectTimer()
      isRegistered.value = false
      deregister()
    }
  }, { immediate: true })

  const clearUnread = (number) => {
    if (number) delete unreadCounts.value[number]
  }

  const totalUnreads = computed(() => {
    return Object.values(unreadCounts.value).reduce((a, b) => a + b, 0)
  })

  return {
    isConnected,
    isRegistered,
    connectionError,
    unreadCounts,
    totalUnreads,
    clearUnread,
    sendMessage,
    sendSignal
  }
})
