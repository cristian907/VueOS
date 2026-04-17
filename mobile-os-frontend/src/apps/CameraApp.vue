<template>
  <div class="w-full h-full bg-black flex flex-col relative overflow-hidden">
    <!-- Camera Viewport -->
    <div class="flex-1 relative bg-black flex items-center justify-center">
      <video 
        ref="videoElement" 
        autoplay 
        playsinline 
        class="w-full h-full object-contain"
        :class="facingMode === 'user' ? '-scale-x-100' : ''"
      ></video>

      <!-- Feedback de Permisos -->
      <div v-if="permissionError" class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center">
        <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p class="text-white font-medium mb-2">Permiso Denegado</p>
        <p class="text-white/60 text-sm">VueOS necesita acceso a tu cámara para funcionar.</p>
        <button @click="initCamera" class="mt-6 px-4 py-2 bg-white/20 rounded-full text-white text-sm">Reintentar</button>
      </div>
      
      <!-- Efecto de Flash (Blanco) -->
      <div v-if="showFlash" class="absolute inset-0 bg-white z-50 animate-flash"></div>
    </div>

    <!-- Controles Inferiores -->
    <div class="h-32 bg-black w-full flex items-center justify-around px-6 pb-6">
      
      <!-- Galería miniatura -->
      <button @click="openGallery" class="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden border border-gray-700 active:scale-95 transition-transform relative">
        <img v-if="lastPhotoUrl" :src="lastPhotoUrl" class="w-full h-full object-cover" />
      </button>

      <!-- Botón de Captura -->
      <button 
        @click="takePhoto" 
        :disabled="permissionError"
        class="w-20 h-20 rounded-full bg-white/30 border-[4px] border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
      >
        <div class="w-[66px] h-[66px] bg-white rounded-full"></div>
      </button>

      <!-- Cambiar Cámara -->
      <button @click="toggleCamera" class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      </button>

    </div>
    
    <!-- Canvas Oculto para capturar -->
    <canvas ref="canvasElement" class="hidden"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../store/db'
import { useKernelStore } from '../store/kernel'

const kernel = useKernelStore()
const videoElement = ref(null)
const canvasElement = ref(null)
let stream = null

const permissionError = ref(false)
const showFlash = ref(false)
const facingMode = ref('environment') // 'environment' o 'user'
const lastPhotoUrl = ref(null)

const initCamera = async () => {
  permissionError.value = false
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    })
    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (error) {
    console.error('[Camera] Error accediendo a la cámara:', error)
    permissionError.value = true
  }
}

const toggleCamera = () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  initCamera()
}

const openGallery = () => {
  kernel.openApp({ id: 'gallery', name: 'Fotos', ramRequired: 1024, component: 'gallery' })
}

const takePhoto = () => {
  if (!stream) return

  // Efecto Flash
  showFlash.value = true
  setTimeout(() => showFlash.value = false, 100)

  const video = videoElement.value
  const canvas = canvasElement.value
  
  // Ajustar tamaño del canvas al video real
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  
  // Si es frontal, invertimos la imagen
  if (facingMode.value === 'user') {
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
  }
  
  // Dibujar
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // Convertir a Blob y guardar
  canvas.toBlob(async (blob) => {
    if (!blob) return
    
    // Generar URL temporal para la miniatura
    if (lastPhotoUrl.value) URL.revokeObjectURL(lastPhotoUrl.value)
    lastPhotoUrl.value = URL.createObjectURL(blob)

    // Guardar en Dexie
    await db.photos.add({
      date: new Date().toISOString(),
      blob: blob
    })
    console.log('[Camera] Foto guardada en IndexedDB.')
  }, 'image/jpeg', 0.9)
}

onMounted(() => {
  initCamera()
  // Cargar la miniatura de la última foto
  db.photos.reverse().first().then(photo => {
    if (photo && photo.blob) {
      lastPhotoUrl.value = URL.createObjectURL(photo.blob)
    }
  })
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  if (lastPhotoUrl.value) URL.revokeObjectURL(lastPhotoUrl.value)
})
</script>

<style scoped>
@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
.animate-flash {
  animation: flash 0.15s ease-out;
}
</style>
