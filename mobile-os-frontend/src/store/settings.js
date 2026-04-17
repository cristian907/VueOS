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

  // Inyección reactiva al HTML raíz
  watch(darkMode, (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('os_dark_mode', isDark)
  }, { immediate: true })

  // --- ACCIONES ---

  /**
   * Valida el PIN ingresado.
   * Si es correcto, desbloquea la pantalla.
   * @returns {boolean} true si el PIN fue correcto
   */
  const validatePin = (input) => {
    if (input === pin.value) {
      isLocked.value = false
      console.log('[Settings] PIN correcto. Dispositivo desbloqueado.')
      return true
    }
    console.warn('[Settings] PIN incorrecto.')
    return false
  }

  /**
   * Cambia el PIN validando el anterior.
   * @returns {{ success: boolean, error: string }}
   */
  const changePin = (oldPin, newPin, confirmPin) => {
    if (oldPin !== pin.value) {
      return { success: false, error: 'El PIN actual es incorrecto.' }
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'El nuevo PIN debe ser de 4 dígitos numéricos.' }
    }
    if (newPin !== confirmPin) {
      return { success: false, error: 'Los PINs nuevos no coinciden.' }
    }
    pin.value = newPin
    localStorage.setItem('os_pin', newPin)
    console.log('[Settings] PIN actualizado correctamente.')
    return { success: true, error: '' }
  }

  /**
   * Establece el número de teléfono ficticio.
   */
  const setPhoneNumber = (number) => {
    phoneNumber.value = number
    localStorage.setItem('os_phone_number', number)
    console.log(`[Settings] Número ficticio actualizado: ${number}`)
  }

  /**
   * Bloquea la pantalla.
   */
  const lock = () => {
    isLocked.value = true
    console.log('[Settings] Dispositivo bloqueado.')
  }

  /**
   * Alterna el tema entre claro y oscuro.
   */
  const toggleTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('os_theme', newTheme)
    console.log(`[Settings] Tema cambiado a: ${newTheme}`)
  }

  return {
    pin,
    phoneNumber,
    isLocked,
    theme,
    validatePin,
    changePin,
    setPhoneNumber,
    lock,
    toggleTheme
  }
})
