<template>
  <div class="h-full w-full bg-white text-black flex flex-col pt-4">
    
    <!-- App Header -->
    <div class="px-6 pb-4 border-b flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <h1 class="text-3xl font-bold">Contactos</h1>
      <button @click="showAddModal = true" class="text-blue-500 text-2xl font-light active:scale-90 transition-transform">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </button>
    </div>

    <!-- Contact List -->
    <div class="flex-1 overflow-y-auto px-4 py-2">
      <div v-if="contactsStore.list.length === 0" class="text-center text-gray-400 mt-10">
        No tienes contactos agregados.
      </div>

      <div 
        v-for="contact in contactsStore.list" 
        :key="contact.id"
        class="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
      >
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg shadow-inner">
          {{ contact.avatar }}
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-lg">{{ contact.name }}</h3>
          <p class="text-gray-500 text-sm">ID: {{ contact.id }}</p>
        </div>
        <!-- Delete Button -->
        <button @click="contactsStore.removeContact(contact.id)" class="text-red-400 p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Add Contact Modal Overlay -->
    <div v-if="showAddModal" class="absolute inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
      <div class="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Nuevo Contacto</h2>
          <button @click="closeModal" class="text-blue-500 font-semibold">Cancelar</button>
        </div>

        <!-- Custom Error Toast / Message -->
        <div v-if="errorMessage" class="mb-4 bg-red-100/80 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ errorMessage }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-gray-500 font-bold mb-1">Nombre</label>
            <input v-model="newName" type="text" class="w-full bg-gray-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Ej. Juan Pérez">
          </div>
          <div>
            <label class="block text-xs uppercase text-gray-500 font-bold mb-1">ID Móvil / Número</label>
            <input v-model="newId" type="text" class="w-full bg-gray-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Ej. j-1234">
          </div>
          
          <button @click="handleSave" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 mt-4 active:scale-95 transition-transform">
            Guardar
          </button>
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

const newName = ref('')
const newId = ref('')
const errorMessage = ref('')

const closeModal = () => {
  showAddModal.value = false
  errorMessage.value = ''
  newName.value = ''
  newId.value = ''
}

const handleSave = () => {
  errorMessage.value = '' // Reiniciar error
  if(!newName.value.trim() || !newId.value.trim()) {
    errorMessage.value = 'Por favor, llena todos los campos.'
    return
  }
  
  const success = contactsStore.addContact(newName.value.trim(), newId.value.trim())
  if(success) {
    closeModal()
  } else {
    errorMessage.value = 'Ese ID ya existe en tu libreta.'
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
