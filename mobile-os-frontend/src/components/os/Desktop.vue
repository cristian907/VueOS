<template>
  <div 
    ref="desktopRoot"
    class="flex-1 h-full z-10 relative overflow-hidden select-none flex flex-col"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- Contenedor Deslizable de Páginas -->
    <div 
      class="flex-1 flex transition-transform duration-500 ease-out"
      :style="{ transform: `translateX(-${currentPage * 100}%)` }"
    >
      <!-- Cada Página -->
      <div 
        v-for="(page, pIndex) in settings.desktopPages" 
        :key="pIndex"
        class="min-w-full h-full px-4 pt-10 grid grid-cols-4 gap-y-8 gap-x-2 content-start"
      >
        <!-- Cada Slot de la Cuadrícula -->
        <div 
          v-for="(app, aIndex) in page" 
          :key="aIndex"
          class="relative flex justify-center items-center h-20 w-full rounded-2xl transition-all duration-200"
          :class="{ 'bg-white/10 ring-2 ring-white/20': isOverPage === pIndex && isOverIndex === aIndex }"
          @dragover.prevent="onDragOver($event, pIndex, aIndex)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, pIndex, aIndex)"
        >
          <!-- Si hay una App en el slot -->
          <div 
            v-if="app"
            draggable="true"
            @dragstart="onDragStart($event, pIndex, aIndex)"
            @dragend="onDragEnd"
            @click="handleOpenApp(app)"
            class="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            :class="{ 'opacity-30 scale-90': draggingPage === pIndex && draggingIndex === aIndex }"
          >
            <DesktopIcon 
              :name="app.name" 
              :color="app.color"
              :badge="app.id === 'vuetext' ? network.totalUnreads : 0"
            >
              <span v-if="app.iconType === 'text'" class="text-white text-2xl font-bold">{{ app.iconValue }}</span>
              <svg v-else-if="app.iconType === 'svg'" class="w-7 h-7 text-white" :class="app.iconValue === 'notes' || app.iconValue === 'contacts' || app.iconValue === 'phone' ? 'fill-current' : ''" viewBox="0 0 24 24">
                 <path v-if="app.iconValue === 'notes'" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                 <path v-else-if="app.iconValue === 'contacts'" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                 <path v-else-if="app.iconValue === 'gallery'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                 <path v-else-if="app.iconValue === 'camera'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                 <path v-if="app.iconValue === 'camera'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                 <path v-else-if="app.iconValue === 'phone'" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                 <path v-else-if="app.iconValue === 'vuetext'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                 <path v-else-if="app.iconValue === 'settings'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                 <path v-if="app.iconValue === 'settings'" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </DesktopIcon>
          </div>
          <!-- Si el slot está vacío -->
          <div v-else class="w-14 h-14 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center pointer-events-none">
             <div class="w-1 h-1 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicador de Páginas (Puntos) -->
    <div class="absolute bottom-10 inset-x-0 flex justify-center gap-2 z-20 pointer-events-none">
      <div 
        v-for="(_, idx) in visibleDotsCount" 
        :key="idx"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="currentPage === idx ? 'bg-white w-4' : 'bg-white/30'"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import { useKernelStore } from '../../store/kernel'
import { useNetworkStore } from '../../store/network'
import { useSettingsStore } from '../../store/settings'
import DesktopIcon from '../DesktopIcon.vue'

const kernel = useKernelStore()
const network = useNetworkStore()
const settings = useSettingsStore()

const currentPage = ref(0)
const handleOpenApp = (app) => {
  if(!app.component) {
    alert('Esta app será desarrollada en las próximas fases.')
    return
  }
  kernel.openApp(app)
}

// --- Gestión de Páginas y Gestos ---
const desktopRoot = ref(null)
let startX = 0
let isDraggingMouse = false
let isDraggingApp = false // Nueva bandera para evitar conflictos

const onTouchStart = (e) => { startX = e.touches[0].clientX }
const onTouchMove = (e) => { handleSwipe(e.touches[0].clientX) }
const onTouchEnd = () => { startX = 0 }

const onMouseDown = (e) => { 
  if (isDraggingApp) return // Si ya estamos arrastrando una app, ignorar para swipe
  startX = e.clientX 
  isDraggingMouse = true
}
const onMouseMove = (e) => {
  if (!isDraggingMouse || isDraggingApp) return
  handleSwipe(e.clientX)
}
const onMouseUp = () => { 
  isDraggingMouse = false
  startX = 0
}

const handleSwipe = (currentX) => {
  if (startX === 0 || isDraggingApp) return
  const deltaX = startX - currentX
  const threshold = 100 // px para considerar swipe
  
  if (Math.abs(deltaX) > threshold) {
    if (deltaX > 0 && currentPage.value < lastOccupiedPageIndex.value) {
      // Permitir avanzar si hay páginas con apps más adelante
      currentPage.value++
      startX = 0 
    } else if (deltaX < 0 && currentPage.value > 0) {
      currentPage.value--
      startX = 0
    }
  }
}

// --- Indicador Dinámico e Índices ---
const lastOccupiedPageIndex = computed(() => {
  let lastIndex = 0
  settings.desktopPages.forEach((page, index) => {
    if (page.some(slot => slot !== null)) {
      lastIndex = index
    }
  })
  return lastIndex
})

const visibleDotsCount = computed(() => {
  // Mostramos puntos hasta la última página con apps, o la actual si estamos más allá
  return Math.max(lastOccupiedPageIndex.value + 1, currentPage.value + 1)
})

// --- Drag & Drop Multi-página ---
const draggingPage = ref(null)
const draggingIndex = ref(null)
const isOverPage = ref(null)
const isOverIndex = ref(null)

let edgeTimer = null

const onDragStart = (e, pIndex, aIndex) => {
  isDraggingApp = true
  draggingPage.value = pIndex
  draggingIndex.value = aIndex
  isDraggingMouse = false // Asegurar que el swipe de mouse no se active
  e.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  isDraggingApp = false
  draggingPage.value = null
  draggingIndex.value = null
  isOverPage.value = null
  isOverIndex.value = null
  clearTimeout(edgeTimer)
  edgeTimer = null
}

const onDragOver = (e, pIndex, aIndex) => {
  isOverPage.value = pIndex
  isOverIndex.value = aIndex

  if (!desktopRoot.value) return
  const rect = desktopRoot.value.getBoundingClientRect()
  const width = rect.width
  const x = e.clientX - rect.left 
  const edgeThreshold = 45 

  if (x < edgeThreshold && currentPage.value > 0) {
    if (!edgeTimer) {
      edgeTimer = setTimeout(() => {
        currentPage.value--
        clearTimeout(edgeTimer) // Reinicio limpio
        edgeTimer = null
      }, 800)
    }
  } else if (x > width - edgeThreshold && currentPage.value < settings.desktopPages.length - 1) {
    if (!edgeTimer) {
      edgeTimer = setTimeout(() => {
        currentPage.value++
        clearTimeout(edgeTimer) // Reinicio limpio
        edgeTimer = null
      }, 800)
    }
  } else {
    clearTimeout(edgeTimer)
    edgeTimer = null
  }
}

const onDragLeave = () => {
  isOverPage.value = null
  isOverIndex.value = null
}

const onDrop = (e, pIndex, aIndex) => {
  isDraggingApp = false
  const fromPage = draggingPage.value
  const fromIndex = draggingIndex.value
  
  if (fromPage === null || fromIndex === null) return
  if (fromPage === pIndex && fromIndex === aIndex) return
  
  const pages = JSON.parse(JSON.stringify(settings.desktopPages))
  const fromApp = pages[fromPage][fromIndex]
  const toApp = pages[pIndex][aIndex]
  
  pages[pIndex][aIndex] = fromApp
  pages[fromPage][fromIndex] = toApp
  
  settings.updateDesktopPages(pages)
  onDragEnd()
}

onUnmounted(() => {
  clearTimeout(edgeTimer)
})
</script>

<style scoped>
.grid {
  touch-action: none;
}
</style>
