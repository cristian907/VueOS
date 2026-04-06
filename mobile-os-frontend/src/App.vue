<template>
  <div class="min-h-screen w-full bg-slate-900 flex items-center justify-center p-0 sm:p-8">
    
    <!-- Mobile Device Container -->
    <div 
      class="relative w-full h-[100dvh] sm:w-[375px] sm:h-[812px] sm:rounded-[40px] overflow-hidden flex flex-col bg-slate-900 shadow-2xl sm:ring-8 ring-slate-800 transition-all font-sans"
    >
      <!-- Wallpaper Background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90 blur-sm mix-blend-overlay"></div>
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div class="absolute top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <!-- OS Status Bar -->
      <StatusBar class="relative z-50" />

      <!-- Main Desktop Area -->
      <div class="flex-1 z-10 px-4 pt-10 relative">
        <!-- App Grid -->
        <div class="grid grid-cols-4 gap-y-6 gap-x-2">
          <DesktopIcon 
            name="Calculadora" 
            color="#f97316"
            @click="handleOpenApp({ id: 'calc', name: 'Calculadora', ramRequired: 1024, component: 'calc' })"
          >
            <span class="text-white text-2xl font-bold">±</span>
          </DesktopIcon>

          <DesktopIcon 
            name="Contactos" 
            color="#22c55e"
            @click="handleOpenApp({ id: 'contacts', name: 'Contactos', ramRequired: 2048, component: 'contacts' })"
          >
            <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </DesktopIcon>
          
          <DesktopIcon 
            name="Teléfono" 
            color="#3b82f6"
            @click="handleOpenApp({ id: 'phone', name: 'Teléfono', ramRequired: 2048, component: null })"
          >
             <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          </DesktopIcon>

          <DesktopIcon 
            name="Mensajes" 
            color="#a855f7"
            @click="handleOpenApp({ id: 'messages', name: 'App de Mensajes', ramRequired: 2048, component: null })"
          >
             <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </DesktopIcon>
        </div>
      </div>

      <!-- Temporal Multitask Button (Dock Item) -->
      <button 
        @click="showMultitask = true"
        class="absolute bottom-16 right-6 z-20 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
      </button>

      <!-- APPS & MULTITASK LAYER (iOS Style) -->
      <!-- Este contenedor asume layout absoluto y cubre todo por debajo del StatusBar. Cuando showMultitask es true, se vuelve flex horizontal -->
      <div 
         ref="scrollContainer"
         class="absolute inset-x-0 bottom-0 z-40 transition-all duration-300 select-none"
         :class="showMultitask ? 'flex flex-row overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-[25%] items-center gap-6 bg-black/60 backdrop-blur-2xl pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'"
         style="top: 2.5rem"
         @mousedown="showMultitask ? onMouseDown($event) : null"
         @mouseleave="showMultitask ? onMouseLeave() : null"
         @mouseup="showMultitask ? onMouseUp() : null"
         @mousemove="showMultitask ? onMouseMove($event) : null"
      >
        <div 
          v-for="app in kernel.activeProcesses" 
          :key="app.id"
          class="transition-all duration-500 origin-center shrink-0 snap-center flex flex-col items-center justify-center"
          :class="[
            !showMultitask && kernel.foregroundAppId === app.id ? 'absolute inset-0 w-full h-full opacity-100 pointer-events-auto scale-100' : '',
            !showMultitask && kernel.foregroundAppId !== app.id ? 'absolute inset-0 w-full h-full opacity-0 pointer-events-none scale-[0.85]' : '',
            showMultitask ? 'relative w-[200px] h-[480px] opacity-100 pointer-events-auto scale-100' : ''
          ]"
        >
          <!-- Cabecera de la App (Multitarea) -->
          <div v-show="showMultitask" class="w-full h-12 flex justify-between items-end mb-2 px-1 transition-opacity duration-300 delay-100 opacity-100">
             <div>
                <h3 v-if="showMultitask" class="text-white font-bold text-lg leading-tight">{{ app.name }}</h3>
                <p v-if="showMultitask" class="text-white/60 text-[10px] font-mono leading-none">RAM: {{ (app.ramRequired * kernel.currentVolatility).toFixed(0) }} MB</p>
             </div>
             <button v-if="showMultitask" @click.stop="kernel.closeApp(app.id)" class="bg-red-500/80 text-white rounded-full p-1.5 hover:bg-red-500 active:scale-90 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>

          <!-- Componente Renderizado Escaldado (Simulando Vistas) -->
          <div 
             class="bg-black origin-center relative transition-all duration-500 w-full"
             :class="!showMultitask ? 'h-full rounded-none shadow-none' : 'h-[412px] rounded-[32px] shadow-2xl ring-1 ring-white/20 overflow-hidden'"
          >
             <!-- Div Trampa para capturar clics (así no tocas la app en miniatura y en su lugar vas hacia ella) -->
             <div v-show="showMultitask" class="absolute inset-0 z-50 cursor-pointer" @click="handleAppClick(app.id)"></div>
             
             <!-- Scaler Mágico: Este div asegura que la aplicación interna siga creyendo que mide 375x772px exactos -->
             <div 
               class="absolute top-0 left-0 origin-top-left flex flex-col"
               :style="showMultitask ? 'transform: scale(0.5333); width: 375px; height: 772px;' : 'width: 100%; height: 100%; transform: scale(1);'"
             >
                <component :is="getComponentFor(app.component)" />
             </div>
          </div>
        </div>
        
        <!-- Mensaje de Vacío -->
        <div v-if="showMultitask && kernel.activeProcesses.length === 0" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <p class="text-white/50 text-xl font-medium">No hay apps recientes</p>
           <button @click="showMultitask = false" class="mt-4 px-6 py-2 bg-white/10 rounded-full text-white/80 pointer-events-auto hover:bg-white/20">Volver al Home</button>
        </div>
      </div>

      <!-- Dock / Bottom Area (Home Button/Indicator) -->
      <div 
        class="h-10 z-40 w-full flex items-center justify-center pb-2 cursor-pointer absolute bottom-2 group"
        @click="minimizeCurrent"
      >
         <div class="h-1.5 w-1/3 bg-white/70 group-active:bg-white/40 group-active:scale-95 transition-all rounded-full drop-shadow-lg"></div> 
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKernelStore } from './store/kernel'
import StatusBar from './components/StatusBar.vue'
import DesktopIcon from './components/DesktopIcon.vue'

// Import Apps
import CalculatorApp from './apps/CalculatorApp.vue'
import ContactsApp from './apps/ContactsApp.vue'

const kernel = useKernelStore()
const showMultitask = ref(false)

// Devuelve el componente importado basado en el string "component" de la app
const getComponentFor = (componentName) => {
  switch(componentName) {
    case 'calc': return CalculatorApp
    case 'contacts': return ContactsApp
    default: return null
  }
}

const handleOpenApp = (app) => {
  if(!app.component) {
    alert('Esta app será desarrollada en las próximas fases.')
    return
  }
  kernel.openApp(app)
}

const minimizeCurrent = () => {
  if (kernel.foregroundAppId) {
    kernel.minimizeApp()
  } else {
    // Si estamos en home, cerrrar el multitask si esta abierto
    showMultitask.value = false
  }
}

const switchToApp = (appId) => {
  kernel.foregroundAppId = appId
  showMultitask.value = false
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
  const walk = (x - startX) * 1.5 // Multiplicador de velocidad
  if (Math.abs(walk) > 10) {
    isDragging = true
  }
  scrollContainer.value.scrollLeft = scrollLeft - walk
}

const handleAppClick = (appId) => {
  if (isDragging) return // Evitar abrir si solo estaba scrolleando
  switchToApp(appId)
}
</script>

<style>
/* Custom animations for the wallpaper background */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fade-in {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(24px); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}

/* Hide scrollbar for multitask */
::-webkit-scrollbar {
  display: none;
}
</style>
