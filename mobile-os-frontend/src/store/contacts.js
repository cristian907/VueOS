import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useContactsStore = defineStore('contacts', () => {
  // Inicializamos desde LocalStorage si existe
  const storedContacts = localStorage.getItem('sim-os-contacts')
  
  const list = ref(storedContacts ? JSON.parse(storedContacts) : [
    { id: '1001', name: 'Simulador Test', avatar: 'ST' }
  ])

  // Observamos cambios para persistir en LocalStorage
  watch(list, (newVal) => {
    localStorage.setItem('sim-os-contacts', JSON.stringify(newVal))
  }, { deep: true })

  const addContact = (name, phoneId) => {
    // Evitar IDs duplicados de manera estricta
    if(!list.value.some(c => c.id === phoneId)) {
      list.value.push({
        id: phoneId, 
        name: name,
        avatar: name.substring(0,2).toUpperCase()
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
