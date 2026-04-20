<template>
  <!-- LockScreen Overlay - Cubre absolutamente todo -->
  <div class="absolute inset-0 z-[60] flex flex-col overflow-hidden select-none">
    
    <!-- Wallpaper Background (propio del lock, no heredado) -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900"></div>
      <div class="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-[100px]"></div>
    </div>

    <!-- Contenido Deslizable -->
    <div 
      class="relative z-10 flex flex-col w-full transition-transform duration-500 ease-out"
      :style="{ transform: `translateY(${slideOffset}px)` }"
      :class="isAnimating ? 'transition-transform' : 'transition-none'"
    >

      <!-- ========== PANTALLA PRINCIPAL (Reloj) ========== -->
      <div class="w-full flex flex-col items-center justify-center px-6" :style="{ minHeight: containerHeight + 'px' }">
        <!-- Hora Grande -->
        <div class="mt-24 text-center">
          <p class="text-white/60 text-lg font-light">{{ dateStr }}</p>
          <h1 class="text-white text-8xl font-extralight tracking-tight leading-none mt-1">{{ timeStr }}</h1>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Indicación de Swipe -->
        <div class="mb-8 flex flex-col items-center gap-3 animate-pulse-slow">
          <svg class="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
          <p class="text-white/40 text-sm font-light">Desliza hacia arriba para desbloquear</p>
        </div>

        <!-- Home Indicator (Zona de agarre para el gesto) -->
        <div 
          class="w-full h-12 flex items-center justify-center cursor-pointer"
          @mousedown="onPointerDown"
          @touchstart.passive="onPointerDown"
        >
          <div class="h-1.5 w-1/3 bg-white/50 rounded-full"></div>
        </div>
      </div>

      <!-- ========== PANTALLA DEL PIN PAD ========== -->
      <div class="w-full flex flex-col items-center justify-start px-6 pt-16" :style="{ minHeight: containerHeight + 'px' }">
        
        <!-- Icono Candado -->
        <div class="mb-6">
          <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        </div>

        <p class="text-white/80 text-base font-light mb-6">Ingresa tu contraseña</p>

        <!-- Dots Indicadores -->
        <div class="flex gap-4 mb-10" :class="{ 'animate-shake': shakeError }">
          <div 
            v-for="i in 4" 
            :key="i" 
            class="w-3.5 h-3.5 rounded-full border-2 transition-all duration-200"
            :class="pinInput.length >= i ? 'bg-white border-white scale-110' : 'bg-transparent border-white/40'"
          ></div>
        </div>

        <!-- Error Message -->
        <p v-if="errorVisible" class="text-red-400 text-sm font-medium mb-4 animate-fade-in">PIN incorrecto. Intenta de nuevo.</p>

        <!-- Pad Numérico -->
        <div class="grid grid-cols-3 gap-x-6 gap-y-4 w-[260px]">
          <button 
            v-for="n in [1,2,3,4,5,6,7,8,9]" 
            :key="n" 
            @click="appendDigit(n)"
            class="w-[72px] h-[72px] rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center text-white text-2xl font-light active:bg-white/30 active:scale-95 transition-all hover:bg-white/20"
          >
            <span>{{ n }}</span>
            <span class="text-[9px] text-white/40 tracking-[0.2em] font-normal mt-0.5">{{ getSubLabel(n) }}</span>
          </button>
          
          <!-- Fila inferior: vacío, 0, borrar -->
          <div></div>
          <button 
            @click="appendDigit(0)" 
            class="w-[72px] h-[72px] rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white text-2xl font-light active:bg-white/30 active:scale-95 transition-all hover:bg-white/20"
          >
            0
          </button>
          <div></div>
        </div>

        <!-- Cancelar / Borrar -->
        <button v-if="pinInput.length === 0" @click="goBackToClock" class="mt-8 text-white/80 font-medium text-sm active:opacity-70 transition-opacity">
          Cancelar
        </button>
        <button v-else @click="deleteDigit" class="mt-8 text-white/80 font-medium text-sm active:opacity-70 transition-opacity">
          Borrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useSettingsStore } from '../../store/settings'

const settingsStore = useSettingsStore()

// --- Reloj ---
const timeStr = ref('')
const dateStr = ref('')
let clockTimer

const updateClock = () => {
  const now = new Date()
  timeStr.value = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: false })
  
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  dateStr.value = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})
onUnmounted(() => clearInterval(clockTimer))

// --- Altura del contenedor (full device height) ---
const containerHeight = ref(772) // Default para SM (812 - 40 status bar)

onMounted(() => {
  // Intentar calcular la altura real del viewport
  const el = document.querySelector('[class*="sm:h-[812px]"]')
  if (el) {
    containerHeight.value = el.clientHeight
  } else {
    containerHeight.value = window.innerHeight
  }
})

// --- Lógica de Slide (Swipe Up) ---
const slideOffset = ref(0)
const isAnimating = ref(false)
let startY = 0
let currentSlideY = 0

const onPointerDown = (e) => {
  if (e.cancelable) e.preventDefault()
  startY = e.clientY || (e.touches && e.touches[0].clientY)
  isAnimating.value = false

  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('touchmove', onPointerMove, { passive: false })
  window.addEventListener('mouseup', onPointerUp)
  window.addEventListener('touchend', onPointerUp)
}

const onPointerMove = (e) => {
  if (e.cancelable) e.preventDefault()
  const currentY = e.clientY || (e.touches && e.touches[0].clientY)
  const deltaY = currentY - startY
  
  // Solo permitir deslizar hacia arriba (negativo)
  if (deltaY < 0) {
    slideOffset.value = deltaY * 0.8 // Resistencia suave
  }
}

const onPointerUp = () => {
  clearSlideListeners()
  isAnimating.value = true

  // Si deslizó lo suficiente (más de 80px), completar la transición
  if (slideOffset.value < -80) {
    slideOffset.value = -containerHeight.value
  } else {
    slideOffset.value = 0
  }
}

const clearSlideListeners = () => {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('touchmove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
  window.removeEventListener('touchend', onPointerUp)
}

const goBackToClock = () => {
  isAnimating.value = true
  slideOffset.value = 0
  pinInput.value = ''
  errorVisible.value = false
}

// --- PIN Pad ---
const pinInput = ref('')
const shakeError = ref(false)
const errorVisible = ref(false)

const appendDigit = (n) => {
  if (pinInput.value.length >= 4) return
  pinInput.value += String(n)
  
  // Auto-validar cuando se completan 4 dígitos
  if (pinInput.value.length === 4) {
    setTimeout(() => {
      const correct = settingsStore.validatePin(pinInput.value)
      if (!correct) {
        shakeError.value = true
        errorVisible.value = true
        setTimeout(() => {
          shakeError.value = false
          pinInput.value = ''
        }, 500)
      }
      // Si es correcto, el componente desaparece (v-if en App.vue lee isLocked)
    }, 200)
  }
}

const deleteDigit = () => {
  pinInput.value = pinInput.value.slice(0, -1)
  errorVisible.value = false
}

// Sub-labels del teclado de iPhone
const getSubLabel = (n) => {
  const labels = {
    2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL',
    6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ'
  }
  return labels[n] || ''
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}
.animate-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
