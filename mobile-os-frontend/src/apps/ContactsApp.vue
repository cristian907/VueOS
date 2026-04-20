<template>
  <div class="w-full h-full bg-neutral-100 dark:bg-slate-900 flex flex-col overflow-hidden transition-colors">
    
    <!-- App Header -->
    <div class="pt-5 px-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
      <h1 class="text-3xl font-bold text-black dark:text-white">Contactos</h1>
      <button @click="showAddModal = true" class="text-blue-500 text-2xl font-light active:scale-90 transition-transform">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </button>
    </div>

    <!-- Contact List -->
    <div class="flex-1 overflow-y-auto px-4 py-2">
      <div v-if="contactsStore.list.length === 0" class="text-center text-gray-400 dark:text-gray-500 mt-10">
        No tienes contactos agregados.
      </div>

      <div 
        v-for="contact in contactsStore.list" 
        :key="contact.id"
        class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
      >
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg shadow-inner shrink-0">
          {{ contact.avatar }}
        </div>
        <div class="flex-1 overflow-hidden">
          <h3 class="font-semibold text-lg text-black dark:text-white truncate">{{ contact.name }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm font-mono mt-0.5">{{ contact.id }}</p>
        </div>
        <button @click="confirmDelete(contact.id)" class="text-red-400 dark:text-red-500 p-2 shrink-0 active:scale-90 transition-transform">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Add Contact Modal Overlay -->
    <div v-if="showAddModal" class="absolute inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
      <div class="bg-white dark:bg-slate-800 w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in transition-colors">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-black dark:text-white">Nuevo Contacto</h2>
          <button @click="closeModal" class="text-blue-500 font-semibold">Cancelar</button>
        </div>

        <!-- Custom Error Toast / Message -->
        <div v-if="errorMessage" class="mb-4 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ errorMessage }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Nombre</label>
            <input v-model="newFirstName" type="text" class="w-full bg-gray-100 dark:bg-slate-700 text-black dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Ej. Juan">
          </div>
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Apellido</label>
            <input v-model="newLastName" type="text" class="w-full bg-gray-100 dark:bg-slate-700 text-black dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Ej. Pérez">
          </div>
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Número Telefónico</label>
            <input 
              v-model="newId" 
              @input="handlePhoneInput" 
              type="tel" 
              inputmode="numeric" 
              class="w-full bg-gray-100 dark:bg-slate-700 text-black dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-mono" 
              placeholder="0414-1234567"
            >
          </div>
          
          <button @click="handleSave" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 mt-4 active:scale-95 transition-transform">
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Contact Modal -->
    <div v-if="contactToDelete" class="absolute inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center animate-slide-up sm:animate-fade-in transition-colors">
        <h3 class="text-xl font-bold text-black dark:text-white mb-2">Eliminar Contacto</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer.</p>
        <div class="flex gap-3">
          <button @click="contactToDelete = null" class="flex-1 bg-gray-200 dark:bg-slate-700 text-black dark:text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">Cancelar</button>
          <button @click="executeDelete" class="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">Eliminar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useContactsStore } from '../store/contacts'

const contactsStore = useContactsStore()
const showAddModal = ref(false)

const newFirstName = ref('')
const newLastName = ref('')
const newId = ref('')
const errorMessage = ref('')
const contactToDelete = ref(null)

const confirmDelete = (id) => {
  contactToDelete.value = id
}

const executeDelete = () => {
  if (contactToDelete.value) {
    contactsStore.removeContact(contactToDelete.value)
    contactToDelete.value = null
  }
}

const closeModal = () => {
  showAddModal.value = false
  errorMessage.value = ''
  newFirstName.value = ''
  newLastName.value = ''
  newId.value = ''
}

// Auto formato XXXX-XXXXXXX (máximo 11 dígitos sin contar guion)
const handlePhoneInput = (e) => {
  // Limpiar cualquier cosa que no sea número
  let val = e.target.value.replace(/\D/g, '')
  
  // Límite de 11 dígitos numéricos
  if (val.length > 11) {
    val = val.substring(0, 11)
  }
  
  // Agregar guion después del 4to dígito
  if (val.length > 4) {
    val = val.substring(0, 4) + '-' + val.substring(4)
  }
  
  newId.value = val
}

const handleSave = () => {
  errorMessage.value = '' 
  if(!newFirstName.value.trim() || !newId.value.trim()) {
    errorMessage.value = 'El nombre y el número son obligatorios.'
    return
  }
  // Verificar longitud mínima del número
  const cleanId = newId.value.replace(/-/g, '')
  if(cleanId.length < 10) {
    errorMessage.value = 'El número es muy corto.'
    return
  }
  
  const success = contactsStore.addContact(newFirstName.value.trim(), newLastName.value.trim(), cleanId)
  if(success) {
    closeModal()
  } else {
    errorMessage.value = 'Este número ya existe en tus contactos.'
  }
}
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
