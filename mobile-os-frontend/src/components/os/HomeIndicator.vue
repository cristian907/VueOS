<template>
  <div 
    class="h-6 z-40 w-full flex items-center justify-center pb-0 cursor-pointer absolute bottom-1 group"
    @mousedown="onHomePointerDown"
    @touchstart.passive="onHomePointerDown"
  >
      <div class="h-1.5 w-1/3 bg-white/70 group-active:bg-white/40 group-active:scale-95 transition-all rounded-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div> 
  </div>
</template>

<script setup>
import { useKernelStore } from '../../store/kernel'

const emit = defineEmits(['toggleMultitask'])
const kernel = useKernelStore()

const minimizeCurrent = () => {
  if (kernel.foregroundAppId) {
    kernel.minimizeApp()
  } else {
    emit('toggleMultitask', false)
  }
}

// ----- Lógica Gestual iOS (Home Swipe UP / Hold) -----
let homeStartY = 0
let homeHoldTimer = null
let homeHasTriggered = false

const onHomePointerDown = (e) => {
  if (e.cancelable) e.preventDefault() 
  homeStartY = e.clientY || (e.touches && e.touches[0].clientY)
  homeHasTriggered = false
  
  window.addEventListener('mousemove', onHomePointerMove)
  window.addEventListener('touchmove', onHomePointerMove, { passive: false })
  window.addEventListener('mouseup', onHomePointerUp)
  window.addEventListener('touchend', onHomePointerUp)
}

const onHomePointerMove = (e) => {
  if (homeHasTriggered) return
  const currentY = e.clientY || (e.touches && e.touches[0].clientY)
  const deltaY = currentY - homeStartY
  
  // Si ha subido al menos 20px
  if (deltaY < -20) {
    if (!homeHoldTimer) {
      homeHoldTimer = setTimeout(() => {
        homeHasTriggered = true
        emit('toggleMultitask', true)
        clearHomeListeners()
      }, 1500) 
    }
  } else {
    if (homeHoldTimer) {
      clearTimeout(homeHoldTimer)
      homeHoldTimer = null
    }
  }
}

const onHomePointerUp = (e) => {
  if (homeHasTriggered) {
    clearHomeListeners()
    return
  }
  
  const currentY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || homeStartY
  const deltaY = currentY - homeStartY
  
  // Condición Estricta: Solo si hay un deslizamiento real hacia arriba
  if (deltaY < -20) {
    minimizeCurrent()
  }
  // No hay fallback para el click estático
  
  clearHomeListeners()
}

const clearHomeListeners = () => {
  if (homeHoldTimer) {
    clearTimeout(homeHoldTimer)
    homeHoldTimer = null
  }
  window.removeEventListener('mousemove', onHomePointerMove)
  window.removeEventListener('touchmove', onHomePointerMove)
  window.removeEventListener('mouseup', onHomePointerUp)
  window.removeEventListener('touchend', onHomePointerUp)
}
</script>
