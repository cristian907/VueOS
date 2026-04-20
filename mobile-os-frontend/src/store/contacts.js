import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useContactsStore = defineStore('contacts', () => {
  // Inicializamos desde LocalStorage si existe
  const storedContacts = localStorage.getItem('sim-os-contacts')
  
  let parsedContacts = []
  if (storedContacts) {
    try {
      parsedContacts = JSON.parse(storedContacts).map(c => ({
        ...c,
        id: c.id.replace(/\D/g, '') // Migración silenciosa: limpiar guiones viejos
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const list = ref(parsedContacts.length > 0 ? parsedContacts : [])

  // Observamos cambios para persistir en LocalStorage
  watch(list, (newVal) => {
    localStorage.setItem('sim-os-contacts', JSON.stringify(newVal))
  }, { deep: true })

  const addContact = (firstName, lastName, phoneId) => {
    // Evitar IDs (números) duplicados de manera estricta
    if(!list.value.some(c => c.id === phoneId)) {
      const fullName = `${firstName} ${lastName}`.trim()
      const firstInitial = firstName.charAt(0) || ''
      const lastInitial = lastName.charAt(0) || ''
      
      list.value.push({
        id: phoneId, 
        firstName: firstName,
        lastName: lastName,
        name: fullName,
        avatar: (firstInitial + lastInitial).toUpperCase() || '#'
      })
      list.value.sort((a,b) => a.name.localeCompare(b.name))
      return true
    }
    return false
  }

  const removeContact = (phoneId) => {
    const idx = list.value.findIndex(c => c.id === phoneId)
    if(idx !== -1) list.value.splice(idx, 1)
  }

  return {
    list,
    addContact,
    removeContact
  }
})
