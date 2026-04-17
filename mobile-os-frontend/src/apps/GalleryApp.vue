<template>
  <div class="w-full h-full bg-white dark:bg-black flex flex-col transition-colors">
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
    <div v-else class="absolute inset-0 z-50 bg-black flex flex-col">
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
        <div class="w-16"></div> <!-- Spacer for center alignment -->
      </div>

      <!-- Imagen -->
      <div class="flex-1 flex items-center justify-center">
        <img :src="fullScreenPhoto.url" class="max-w-full max-h-full object-contain" />
      </div>

      <!-- Bottom Bar -->
      <div class="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-6 pb-4">
        <button class="text-white p-2 opacity-0 cursor-default">
           <!-- Compartir placeholder -->
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        </button>
        <button @click="deletePhoto(fullScreenPhoto.id)" class="text-white p-2 active:scale-90 transition-transform">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from '../store/db'
import { useKernelStore } from '../store/kernel'

const kernel = useKernelStore()
const photos = ref([])
const fullScreenPhoto = ref(null)

const loadPhotos = async () => {
  try {
    const records = await db.photos.reverse().toArray()
    // Limpiar URLs previas
    photos.value.forEach(p => URL.revokeObjectURL(p.url))
    
    // Crear nuevas URLs temporales
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

onMounted(() => {
  loadPhotos()
})

// Recargar fotos cada vez que la app vuelve a estar en pantalla
watch(() => kernel.foregroundAppId, (newId) => {
  if (newId === 'gallery') {
    loadPhotos()
  }
})

onUnmounted(() => {
  photos.value.forEach(p => URL.revokeObjectURL(p.url))
})

const openPhoto = (photo) => {
  fullScreenPhoto.value = photo
}

const closePhoto = () => {
  fullScreenPhoto.value = null
}

const deletePhoto = async (id) => {
  if (confirm('¿Eliminar esta foto?')) {
    await db.photos.delete(id)
    fullScreenPhoto.value = null
    loadPhotos()
  }
}
</script>
