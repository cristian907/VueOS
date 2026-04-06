import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKernelStore = defineStore('kernel', () => {
  // --- ESTADO ---
  // Memoria RAM total simulada (8 GB = 8192 MB)
  const totalRAM = ref(8192) 
  // RAM actualmente en uso por el OS (base) y las apps
  const usedRAM = ref(512) // 128 MB reservados para el "sistema operativo"
  // Lista de aplicaciones actualmente abiertas en la multitarea
  const activeProcesses = ref([])
  // App actual en primer plano (null = escritorio)
  const foregroundAppId = ref(null)

  // --- RAM DINÁMICA VIRTUAL ---
  const dynamicUsedRAM = ref(usedRAM.value)
  const currentVolatility = ref(1)
  const ramUpdateIntervalMs = 1000 // Configurable update time
  
  setInterval(() => {
    // Crea una variación de entre -25% y +25% del consumo actual (usedRAM base + apps)
    const variacionPorcentaje = (Math.random() * 50 - 25) / 100
    currentVolatility.value = 1 + variacionPorcentaje
    
    let fluctuacion = usedRAM.value * currentVolatility.value
    
    // Limits
    if(fluctuacion > totalRAM.value) fluctuacion = totalRAM.value
    if(fluctuacion < 128) fluctuacion = 128
    
    dynamicUsedRAM.value = fluctuacion
  }, ramUpdateIntervalMs)

  // --- GETTERS ---
  // Calculamos la RAM disponible dinámicamente usando la RAM con ruido
  const availableRAM = computed(() => totalRAM.value - dynamicUsedRAM.value)

  // Minimizar app
  const minimizeApp = () => {
    foregroundAppId.value = null
  }

  // Intentar abrir o resumir una aplicación
  const openApp = (app) => {
    // Si ya está en pantalla
    if (foregroundAppId.value === app.id) return true
    
    // Verificamos si la app ya está abierta en segundo plano
    const isAppRunning = activeProcesses.value.find(p => p.id === app.id)
    if (isAppRunning) {
      foregroundAppId.value = app.id // La traemos al frente
      console.log(`[Kernel] App '${app.name}' restaurada desde segundo plano.`)
      return true
    }
    
    // Calculamos RAM base real (sin la fluctuación visual) para el gestor OOM
    let realAvailableRAM = totalRAM.value - usedRAM.value
    
    // Gestión OOM Autokill: Si hace falta, matamos el proceso en fondo más viejo (posición 0)
    while (realAvailableRAM < app.ramRequired && activeProcesses.value.length > 0) {
      const oldestApp = activeProcesses.value[0]
      console.warn(`[Kernel - OOM] RAM insuficiente. Matando proceso en fondo: '${oldestApp.name}'`)
      closeApp(oldestApp.id)
      realAvailableRAM = totalRAM.value - usedRAM.value
    }

    if (realAvailableRAM >= app.ramRequired) {
      activeProcesses.value.push(app)
      usedRAM.value += app.ramRequired
      foregroundAppId.value = app.id // La ponemos al frente
      console.log(`[Kernel] App '${app.name}' lanzada. Consumo RAM: ${app.ramRequired}MB`)
      return true
    } else {
      console.error(`[Kernel - OOM Crítico] Imposible abrir '${app.name}'. RAM Libre real: ${realAvailableRAM}MB`)
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
      console.log(`[Kernel] App '${appToClose.name}' cerrada totalmente (proceso destruido).`)
      if (foregroundAppId.value === appId) {
        foregroundAppId.value = null // Si la app estaba activa y la matamos manual, vamos al home
      }
    }
  }

  return {
    totalRAM,
    usedRAM,
    dynamicUsedRAM,
    currentVolatility,
    activeProcesses,
    foregroundAppId,
    availableRAM,
    openApp,
    closeApp,
    minimizeApp
  }
})
