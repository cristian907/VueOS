<template>
  <div class="w-full h-full bg-white dark:bg-black flex flex-col transition-colors relative overflow-hidden">
    <!-- Header -->
    <div class="bg-white/90 dark:bg-black/90 backdrop-blur-md pt-5 pb-3 px-5 flex-shrink-0 flex justify-between items-center z-10">
      <h1 class="text-3xl font-bold text-black dark:text-white">Fotos</h1>
    </div>

    <!-- Grid de Fotos -->
    <div v-if="!fullScreenPhoto" class="flex-1 overflow-y-auto p-1">
      <div v-if="photos.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <p>No hay fotos o videos</p>
      </div>

      <div class="grid grid-cols-3 gap-1">
        <div 
          v-for="photo in photos" 
          :key="photo.id"
          @click="openPhoto(photo)"
          class="aspect-square bg-gray-200 dark:bg-slate-800 cursor-pointer overflow-hidden active:opacity-70 transition-opacity"
        >
          <img :src="photo.url" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Vista Pantalla Completa -->
    <div v-else class="absolute inset-0 z-40 bg-black flex flex-col">
      <!-- Header Overlay -->
      <div class="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 to-transparent flex items-center px-4 z-10 pt-4">
        <button @click="closePhoto" class="text-white flex items-center gap-1 active:opacity-70">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          Fotos
        </button>
        <div class="flex-1 text-center">
          <p class="text-white text-xs font-medium">{{ new Date(fullScreenPhoto.date).toLocaleDateString() }}</p>
          <p class="text-white/60 text-[10px]">{{ new Date(fullScreenPhoto.date).toLocaleTimeString() }}</p>
        </div>
        <div class="w-16"></div>
      </div>

      <!-- Imagen -->
      <div class="flex-1 flex items-center justify-center p-2">
        <img :src="fullScreenPhoto.url" class="max-w-full max-h-full object-contain shadow-2xl" />
      </div>

      <!-- Bottom Bar -->
      <div class="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-around px-6 pb-6">
        <!-- Botón Fondo -->
        <button @click="setAsWallpaper(fullScreenPhoto)" class="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
           <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
           </div>
           <span class="text-[10px] font-medium">Fondo</span>
        </button>

        <!-- Botón Borrar -->
        <button @click="confirmDelete = true" class="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform">
           <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
             <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
           </div>
           <span class="text-[10px] font-medium text-red-500">Eliminar</span>
        </button>
      </div>

      <!-- Modal de Confirmación Integrado -->
      <div v-if="confirmDelete" class="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmDelete = false"></div>
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
          <div class="p-6 text-center">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">¿Eliminar foto?</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Esta acción no se puede deshacer.</p>
          </div>
          <div class="flex border-t border-gray-100 dark:border-gray-800">
            <button @click="confirmDelete = false" class="flex-1 py-4 text-gray-600 dark:text-gray-300 font-medium active:bg-gray-50 dark:active:bg-slate-800 border-r border-gray-100 dark:border-gray-800">
              Cancelar
            </button>
            <button @click="handleDelete" class="flex-1 py-4 text-red-500 font-bold active:bg-gray-50 dark:active:bg-slate-800">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Toast de Fondo Actualizado -->
      <div v-if="showToast" class="absolute top-24 inset-x-0 flex justify-center z-[60] pointer-events-none">
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-toast">
           <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
             <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
           </div>
           <span class="text-sm font-bold text-gray-900 dark:text-white">Fondo actualizado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from '../store/db'
import { useKernelStore } from '../store/kernel'
import { useSettingsStore } from '../store/settings'

const kernel = useKernelStore()
const settings = useSettingsStore()
const photos = ref([])
const fullScreenPhoto = ref(null)
const confirmDelete = ref(false)
const showToast = ref(false)

const loadPhotos = async () => {
  try {
    const records = await db.photos.reverse().toArray()
    photos.value.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) })
    photos.value = records.map(record => ({
      id: record.id,
      date: record.date,
      blob: record.blob,
      url: URL.createObjectURL(record.blob)
    }))
  } catch (err) {
    console.error('[Gallery] Error:', err)
  }
}

onMounted(() => { loadPhotos() })

watch(() => kernel.foregroundAppId, (newId) => {
  if (newId === 'gallery') loadPhotos()
})

onUnmounted(() => {
  photos.value.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) })
})

const openPhoto = (photo) => { fullScreenPhoto.value = photo }
const closePhoto = () => {
  fullScreenPhoto.value = null
  confirmDelete.value = false
}

const handleDelete = async () => {
  if (fullScreenPhoto.value) {
    await db.photos.delete(fullScreenPhoto.value.id)
    fullScreenPhoto.value = null
    confirmDelete.value = false
    loadPhotos()
  }
}

const setAsWallpaper = (photo) => {
  if (!photo || !photo.blob) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    // IMPORTANTE: Aseguramos que la señal llegue a Pinia y se persista
    settings.setWallpaper(e.target.result)
    
    // Mostrar Toast en lugar de alert
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2500)
  }
  reader.readAsDataURL(photo.blob)
}
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-toast {
  animation: toast-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes toast-in {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
