import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useNetworkStore } from './network'

// Use Google's public STUN servers for WebRTC
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

import { useNotificationStore } from './notification'

export const useCallStore = defineStore('call', () => {
  const networkStore = useNetworkStore()
  const notificationStore = useNotificationStore()
  
  const callState = ref('IDLE') // IDLE, CALLING, RINGING, ACTIVE
  const remoteNumber = ref(null)
  const isVideoCall = ref(false)
  const callDuration = ref(0)
  const callHistory = ref(JSON.parse(localStorage.getItem('os_call_history') || '[]'))
  const callDirection = ref(null)
  
  let timerInterval = null
  
  const localStream = ref(null)
  const remoteStream = ref(null)
  
  let peerConnection = null
  let audioCtx = null
  let pingInterval = null
  let callTimeout = null

  const startPingSound = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (pingInterval) return

    const playPing = () => {
      if (audioCtx.state === 'suspended') audioCtx.resume()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(660, audioCtx.currentTime) // Tono agradable
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8)
      
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      
      osc.start()
      osc.stop(audioCtx.currentTime + 0.8)
    }

    playPing()
    pingInterval = setInterval(playPing, 2000)
  }

  const stopPingSound = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  watch(callState, (newState) => {
    // Limpiar timeout previo si existe
    if (callTimeout) {
      clearTimeout(callTimeout)
      callTimeout = null
    }

    if (newState === 'ACTIVE') {
      stopPingSound()
      addCallToHistory(remoteNumber.value, callDirection.value, isVideoCall.value)
      callDuration.value = 0
      timerInterval = setInterval(() => {
        callDuration.value++
      }, 1000)
    } else if (newState === 'CALLING' || newState === 'RINGING') {
      startPingSound()
      // Límite de 10 segundos para aceptar la llamada
      callTimeout = setTimeout(() => {
        console.log('[WebRTC] Tiempo de espera agotado')
        notificationStore.show('La llamada no fue respondida', 'error')
        endCall()
      }, 10000)
    } else {
      stopPingSound()
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  })

  // type: 'outgoing' | 'incoming'
  const addCallToHistory = (number, type, isVideo) => {
    callHistory.value.unshift({
      number,
      type,
      isVideo,
      date: new Date().toISOString()
    })
    if (callHistory.value.length > 50) callHistory.value.pop()
    localStorage.setItem('os_call_history', JSON.stringify(callHistory.value))
  }

  const resetState = () => {
    callState.value = 'IDLE'
    remoteNumber.value = null
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }
    remoteStream.value = null
    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }
  }

  const setupPeerConnection = (targetNumber) => {
    peerConnection = new RTCPeerConnection(iceServers)
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Recibiendo track remoto')
      remoteStream.value = event.streams[0]
    }

    // Send ICE candidates to remote peer
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        networkStore.sendSignal(targetNumber, {
          type: 'ice-candidate',
          candidate: event.candidate
        })
      }
    }

    peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', peerConnection.connectionState)
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'closed') {
        endCall()
      }
    }
  }

  const getMedia = async (isVideo = false) => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo })
      return true
    } catch (err) {
      console.error('[WebRTC] Error accediendo a media:', err)
      alert('Se necesitan permisos de cámara/micrófono para realizar la llamada.')
      return false
    }
  }

  // --- ACTIONS ---

  const startCall = async (targetNumber, isVideo = false) => {
    if (callState.value !== 'IDLE') return
    if (!targetNumber) return

    isVideoCall.value = isVideo
    const hasMedia = await getMedia(isVideo)
    if (!hasMedia) return

    callState.value = 'CALLING'
    remoteNumber.value = targetNumber
    callDirection.value = 'outgoing'

    setupPeerConnection(targetNumber)
    
    // Add local tracks
    localStream.value.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream.value)
    })

    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      networkStore.sendSignal(targetNumber, {
        type: 'offer',
        sdp: offer,
        isVideo: isVideo
      })
    } catch (err) {
      console.error('[WebRTC] Error creando offer:', err)
      endCall()
    }
  }

  const acceptCall = async () => {
    if (callState.value !== 'RINGING') return
    
    const hasMedia = await getMedia(isVideoCall.value)
    if (!hasMedia) {
      rejectCall()
      return
    }

    callState.value = 'ACTIVE'
    
    // Add local tracks to existing peer connection
    localStream.value.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream.value)
    })

    try {
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      networkStore.sendSignal(remoteNumber.value, {
        type: 'answer',
        sdp: answer
      })
    } catch (err) {
      console.error('[WebRTC] Error creando answer:', err)
      endCall()
    }
  }

  const rejectCall = () => {
    if (remoteNumber.value) {
      networkStore.sendSignal(remoteNumber.value, { type: 'reject' })
    }
    resetState()
  }

  const endCall = () => {
    if (remoteNumber.value) {
      networkStore.sendSignal(remoteNumber.value, { type: 'hangup' })
    }
    resetState()
  }

  // Handle signals from websocket (dispatched from networkStore)
  const handleIncomingSignal = async (sender, payload) => {
    console.log(`[WebRTC] Señal de ${sender}:`, payload.type)

    if (payload.type === 'offer') {
      if (callState.value !== 'IDLE') {
        networkStore.sendSignal(sender, { type: 'reject', reason: 'busy' })
        return
      }
      
      remoteNumber.value = sender
      callState.value = 'RINGING'
      callDirection.value = 'incoming'
      isVideoCall.value = !!payload.isVideo
      
      setupPeerConnection(sender)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp))
    } 
    else if (payload.type === 'answer') {
      if (callState.value === 'CALLING') {
        callState.value = 'ACTIVE'
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      }
    } 
    else if (payload.type === 'ice-candidate') {
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } catch (e) {
          console.error('[WebRTC] Error añadiendo ICE candidate', e)
        }
      }
    }
    else if (payload.type === 'reject') {
      console.log('[WebRTC] Llamada rechazada')
      resetState()
    }
    else if (payload.type === 'hangup') {
      console.log('[WebRTC] Llamada finalizada por el otro par')
      resetState()
    }
  }

  return {
    callState,
    remoteNumber,
    callDuration,
    callHistory,
    isVideoCall,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    handleIncomingSignal
  }
})
