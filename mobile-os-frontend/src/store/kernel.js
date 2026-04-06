import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKernelStore = defineStore('kernel', () => {
  // --- ESTADO ---
  // Memoria RAM total simulada (8 GB = 8192 MB)
  const totalRAM = ref(8192) 
  // RAM actualmente en uso por el OS (base) y las apps
  const usedRAM = ref(128) // 128 MB reservados para el "sistema operativo"
  // Lista de aplicaciones actualmente abiertas en la multitarea
  const activeProcesses = ref([])

  // --- GETTERS ---
  // Calculamos la RAM disponible dinámicamente
  const availableRAM = computed(() => totalRAM.value - usedRAM.value)

  // --- ACCIONES ---
  // Intentar abrir una aplicación
  const openApp = (app) => {
    // Verificamos si la app ya está abierta
    const isAppRunning = activeProcesses.value.find(p => p.id === app.id)
    if (isAppRunning) return true // Ya está en memoria
    
    // Verificamos si hay RAM suficiente (Gestión OOM)
    if (availableRAM.value >= app.ramRequired) {
      activeProcesses.value.push(app)
      usedRAM.value += app.ramRequired
      console.log(`[Kernel] App '${app.name}' lanzada. Consumo RAM: ${app.ramRequired}MB`)
      return true
    } else {
      console.warn(`[Kernel - OOM] RAM insuficiente para abrir '${app.name}'. RAM Libre: ${availableRAM.value}MB`)
      // Aquí se podría emitir un evento para la UI u obligar a cerrar una app de fondo
      return false
    }
  }

  // Cerrar y liberar RAM de una aplicación
  const closeApp = (appId) => {
    const processIndex = activeProcesses.value.findIndex(p => p.id === appId)
    if (processIndex !== -1) {
      const appToClose = activeProcesses.value[processIndex]
      usedRAM.value -= appToClose.ramRequired
      activeProcesses.value.splice(processIndex, 1)
      console.log(`[Kernel] App '${appToClose.name}' cerrada. Memoria liberada.`)
    }
  }

  return {
    totalRAM,
    usedRAM,
    activeProcesses,
    availableRAM,
    openApp,
    closeApp
  }
})
