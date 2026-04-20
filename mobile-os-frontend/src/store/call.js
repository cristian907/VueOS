import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNetworkStore } from './network'

// Use Google's public STUN servers for WebRTC
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

export const useCallStore = defineStore('call', () => {
  const networkStore = useNetworkStore()
  
  const callState = ref('IDLE') // IDLE, CALLING, RINGING, ACTIVE
  const remoteNumber = ref(null)
  
  const localStream = ref(null)
  const remoteStream = ref(null)
  
  let peerConnection = null

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

  const getMedia = async () => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      return true
    } catch (err) {
      console.error('[WebRTC] Error accediendo al micrófono:', err)
      alert('Se necesita permiso de micrófono para realizar la llamada.')
      return false
    }
  }

  // --- ACTIONS ---

  const startCall = async (targetNumber) => {
    if (callState.value !== 'IDLE') return
    if (!targetNumber) return

    const hasMedia = await getMedia()
    if (!hasMedia) return

    callState.value = 'CALLING'
    remoteNumber.value = targetNumber

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
        sdp: offer
      })
    } catch (err) {
      console.error('[WebRTC] Error creando offer:', err)
      endCall()
    }
  }

  const acceptCall = async () => {
    if (callState.value !== 'RINGING') return
    
    const hasMedia = await getMedia()
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
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    handleIncomingSignal
  }
})
