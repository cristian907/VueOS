import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // --- PIN DE SEGURIDAD ---
  const DEFAULT_PIN = '1234'
  const pin = ref(localStorage.getItem('os_pin') || DEFAULT_PIN)

  // --- NÚMERO VIRTUAL (P2P) ---
  const phoneNumber = ref(localStorage.getItem('os_phone_number') || '')

  // --- ESTADO DE BLOQUEO ---
  const isLocked = ref(true) // Siempre arranca bloqueado

  // --- TEMA (Claro/Oscuro) ---
  const theme = ref(localStorage.getItem('os_theme') || 'dark')

  // --- MODO OSCURO ---
  const darkMode = ref(localStorage.getItem('os_dark_mode') === 'true')

  // --- CONFIGURACIÓN DEL ESCRITORIO (Multi-página) ---
  const initialApps = [
    { id: 'calc', name: 'Calculadora', color: '#f97316', iconType: 'text', iconValue: '±', ramRequired: 1024, component: 'calc' },
    { id: 'notes', name: 'Notas', color: '#eab308', iconType: 'svg', iconValue: 'notes', ramRequired: 256, component: 'notes' },
    { id: 'contacts', name: 'Contactos', color: '#22c55e', iconType: 'svg', iconValue: 'contacts', ramRequired: 2048, component: 'contacts' },
    { id: 'gallery', name: 'Fotos', color: '#f43f5e', iconType: 'svg', iconValue: 'gallery', ramRequired: 1024, component: 'gallery' },
    { id: 'camera', name: 'Cámara', color: '#737373', iconType: 'svg', iconValue: 'camera', ramRequired: 3072, component: 'camera' },
    { id: 'phone', name: 'VueCall', color: '#3b82f6', iconType: 'svg', iconValue: 'phone', ramRequired: 2048, component: 'vuecall' },
    { id: 'vuetext', name: 'VueText', color: '#3b82f6', iconType: 'svg', iconValue: 'vuetext', ramRequired: 1024, component: 'vuetext' },
    { id: 'settings', name: 'Ajustes', color: '#6b7280', iconType: 'svg', iconValue: 'settings', ramRequired: 512, component: 'settings' }
  ]

  const createFullGrid = (apps) => {
    const grid = Array(24).fill(null)
    apps.forEach((app, index) => {
      if (index < 24) grid[index] = app
    })
    return grid
  }

  // Ahora desktopApps es un array de páginas [ [...24], [...24] ]
  const getInitialDesktop = () => {
    const saved = localStorage.getItem('os_desktop_pages')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch(e) {}
    }
    // Por defecto 2 páginas
    return [createFullGrid(initialApps), createFullGrid([])]
  }

  const desktopPages = ref(getInitialDesktop())

  const updateDesktopPages = (newPages) => {
    // Limpiar páginas vacías al final si hay más de una
    let cleaned = [...newPages]
    while (cleaned.length > 1 && cleaned[cleaned.length - 1].every(slot => slot === null)) {
      cleaned.pop()
    }
    // Asegurar que siempre haya una página vacía al final para mover apps si la actual está llena?
    // Por ahora dejarlo simple: si la última no está vacía, añadir una nueva.
    if (!cleaned[cleaned.length - 1].every(slot => slot === null)) {
        cleaned.push(createFullGrid([]))
    }

    desktopPages.value = cleaned
    localStorage.setItem('os_desktop_pages', JSON.stringify(cleaned))
  }

  // Inyección reactiva al HTML raíz
  watch(darkMode, (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('os_dark_mode', isDark)
  }, { immediate: true })

  const validatePin = (input) => {
    if (input === pin.value) {
      isLocked.value = false
      return true
    }
    return false
  }

  const changePin = (oldPin, newPin, confirmPin) => {
    if (oldPin !== pin.value) return { success: false, error: 'PIN actual incorrecto' }
    if (newPin.length !== 4) return { success: false, error: 'El PIN debe ser de 4 dígitos' }
    if (newPin !== confirmPin) return { success: false, error: 'No coinciden' }
    pin.value = newPin
    localStorage.setItem('os_pin', newPin)
    return { success: true }
  }

  const setPhoneNumber = (number) => {
    phoneNumber.value = number
    localStorage.setItem('os_phone_number', number)
  }

  const lock = () => { isLocked.value = true }

  const toggleTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('os_theme', newTheme)
  }

  return {
    pin,
    phoneNumber,
    isLocked,
    theme,
    darkMode,
    desktopPages,
    validatePin,
    changePin,
    setPhoneNumber,
    lock,
    toggleTheme,
    updateDesktopPages
  }
})
