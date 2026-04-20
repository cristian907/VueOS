<template>
  <div 
      ref="scrollContainer"
      class="absolute inset-x-0 bottom-0 z-40 transition-all duration-300 select-none"
      :class="props.showMultitask ? 'flex flex-row overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-[25%] items-center gap-6 bg-black/60 backdrop-blur-2xl pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'"
      style="top: 2.5rem"
      @mousedown="props.showMultitask ? onMouseDown($event) : null"
      @mouseleave="props.showMultitask ? onMouseLeave() : null"
      @mouseup="props.showMultitask ? onMouseUp() : null"
      @mousemove="props.showMultitask ? onMouseMove($event) : null"
  >
    <div 
      v-for="app in kernel.activeProcesses" 
      :key="app.id"
      class="transition-all duration-500 origin-center shrink-0 snap-center flex flex-col items-center justify-center"
      :class="[
        !props.showMultitask && kernel.foregroundAppId === app.id ? 'absolute inset-0 w-full h-full opacity-100 pointer-events-auto scale-100' : '',
        !props.showMultitask && kernel.foregroundAppId !== app.id ? 'absolute inset-0 w-full h-full opacity-0 pointer-events-none scale-[0.85]' : '',
        props.showMultitask ? 'relative w-[200px] h-[480px] opacity-100 pointer-events-auto scale-100' : ''
      ]"
    >
      <!-- Cabecera de la App (Multitarea) -->
      <div v-show="props.showMultitask" class="w-full h-12 flex justify-between items-end mb-2 px-1 transition-opacity duration-300 delay-100 opacity-100">
          <div>
            <h3 class="text-white font-bold text-lg leading-tight">{{ app.name }}</h3>
            <p class="text-white/60 text-[10px] font-mono leading-none">RAM: {{ (app.ramRequired * kernel.currentVolatility).toFixed(0) }} MB</p>
          </div>
          <button @click.stop="kernel.closeApp(app.id)" class="bg-red-500/80 text-white rounded-full p-1.5 hover:bg-red-500 active:scale-90 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
      </div>

      <!-- Componente Renderizado Escaldado (Simulando Vistas) -->
      <div 
          class="bg-black origin-center relative transition-all duration-500 w-full"
          :class="!props.showMultitask ? 'h-full rounded-b-[40px] shadow-none overflow-hidden' : 'h-[412px] rounded-[32px] shadow-2xl ring-1 ring-white/20 overflow-hidden'"
      >
          <!-- Div Trampa para capturar clics -->
          <div v-show="props.showMultitask" class="absolute inset-0 z-50 cursor-pointer" @click="handleAppClick(app.id)"></div>
          
          <!-- Scaler Mágico -->
          <div 
            class="absolute top-0 left-0 origin-top-left flex flex-col"
            :style="props.showMultitask ? 'transform: scale(0.5333); width: 375px; height: 772px;' : 'width: 100%; height: 100%; transform: scale(1);'"
          >
            <component :is="getComponentFor(app.component)" />
          </div>
      </div>
    </div>
    
    <!-- Mensaje de Vacío -->
    <div v-if="props.showMultitask && kernel.activeProcesses.length === 0" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p class="text-white/50 text-xl font-medium">No hay apps recientes</p>
        <button @click="emit('toggleMultitask', false)" class="mt-4 px-6 py-2 bg-white/10 rounded-full text-white/80 pointer-events-auto hover:bg-white/20">Volver al Home</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKernelStore } from '../../store/kernel'

import CalculatorApp from '../../apps/CalculatorApp.vue'
import ContactsApp from '../../apps/ContactsApp.vue'
import SettingsApp from '../../apps/SettingsApp.vue'
import NotesApp from '../../apps/NotesApp.vue'
import CameraApp from '../../apps/CameraApp.vue'
import GalleryApp from '../../apps/GalleryApp.vue'
import VueTextApp from '../../apps/VueTextApp.vue'
import VueCallApp from '../../apps/VueCallApp.vue'

const props = defineProps({
  showMultitask: Boolean
})
const emit = defineEmits(['toggleMultitask'])

const kernel = useKernelStore()

const getComponentFor = (componentName) => {
  switch(componentName) {
    case 'calc': return CalculatorApp
    case 'contacts': return ContactsApp
    case 'settings': return SettingsApp
    case 'notes': return NotesApp
    case 'camera': return CameraApp
    case 'gallery': return GalleryApp
    case 'vuetext': return VueTextApp
    case 'vuecall': return VueCallApp
    default: return null
  }
}

// ----- Lógica de Drag & Scroll (Mouse) en Multitarea -----
const scrollContainer = ref(null)
let isDown = false
let startX = 0
let scrollLeft = 0
let isDragging = false

const onMouseDown = (e) => {
  isDown = true
  isDragging = false
  startX = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft = scrollContainer.value.scrollLeft
  scrollContainer.value.classList.remove('snap-mandatory', 'snap-x')
}

const onMouseLeave = () => {
  isDown = false
  if(scrollContainer.value) scrollContainer.value.classList.add('snap-mandatory', 'snap-x')
}

const onMouseUp = () => {
  isDown = false
  if(scrollContainer.value) scrollContainer.value.classList.add('snap-mandatory', 'snap-x')
}

const onMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX) * 1.5
  if (Math.abs(walk) > 10) {
    isDragging = true
  }
  scrollContainer.value.scrollLeft = scrollLeft - walk
}

const handleAppClick = (appId) => {
  if (isDragging) return
  kernel.foregroundAppId = appId
  emit('toggleMultitask', false)
}
</script>
