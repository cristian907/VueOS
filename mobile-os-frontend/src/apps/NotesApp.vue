<template>
  <div class="w-full h-full bg-[#f8f9fa] dark:bg-slate-900 flex flex-col transition-colors">
    <!-- Header -->
    <div class="bg-[#f8f9fa] dark:bg-slate-900 pt-5 pb-3 px-5 flex-shrink-0 border-b border-gray-200 dark:border-slate-800 transition-colors flex justify-between items-center">
      <h1 class="text-3xl font-bold text-[#eab308] dark:text-yellow-500">Notas</h1>
      <button 
        v-if="!isEditing" 
        @click="createNewNote" 
        class="text-[#eab308] dark:text-yellow-500"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      </button>
      <button 
        v-else 
        @click="closeEditor" 
        class="text-[#eab308] dark:text-yellow-500 font-medium"
      >
        Listo
      </button>
    </div>

    <!-- Lista de Notas -->
    <div v-if="!isEditing" class="flex-1 overflow-y-auto px-5 pt-4 pb-8 space-y-3">
      <div v-if="notes.length === 0" class="text-center text-gray-400 dark:text-slate-500 mt-10">
        <p>No hay notas</p>
      </div>
      
      <div 
        v-for="note in notes" 
        :key="note.id" 
        @click="openNote(note)"
        class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm cursor-pointer transition-transform active:scale-95 flex justify-between items-start group"
      >
        <div class="flex-1 overflow-hidden">
          <h2 class="text-black dark:text-white font-semibold truncate">{{ note.title || 'Nueva nota' }}</h2>
          <p class="text-gray-500 dark:text-slate-400 text-sm truncate mt-1">{{ note.content || 'Sin texto adicional' }}</p>
          <span class="text-xs text-gray-400 dark:text-slate-500 mt-2 block">{{ new Date(note.date).toLocaleDateString() }}</span>
        </div>
        <button 
          @click.stop="deleteNote(note.id)" 
          class="text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Editor de Notas -->
    <div v-else class="flex-1 flex flex-col bg-[#f8f9fa] dark:bg-slate-900 p-5 transition-colors">
      <input 
        v-model="currentNote.title" 
        type="text" 
        placeholder="Título" 
        class="text-2xl font-bold bg-transparent text-black dark:text-white focus:outline-none mb-4 placeholder-gray-300 dark:placeholder-slate-600"
      />
      <textarea 
        v-model="currentNote.content" 
        placeholder="Empieza a escribir..." 
        class="flex-1 bg-transparent text-gray-800 dark:text-slate-300 text-lg resize-none focus:outline-none placeholder-gray-300 dark:placeholder-slate-600"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../store/db'

const notes = ref([])
const isEditing = ref(false)
const currentNote = ref({ id: null, title: '', content: '', date: '' })

// Cargar notas desde IndexedDB
const loadNotes = async () => {
  try {
    const allNotes = await db.notes.reverse().toArray()
    notes.value = allNotes
  } catch (error) {
    console.error('[NotesApp] Error loading notes:', error)
  }
}

onMounted(() => {
  loadNotes()
})

const createNewNote = () => {
  currentNote.value = {
    title: '',
    content: '',
    date: new Date().toISOString()
  }
  isEditing.value = true
}

const openNote = (note) => {
  currentNote.value = { ...note }
  isEditing.value = true
}

// Guardado automático al cerrar
const closeEditor = async () => {
  if (currentNote.value.title.trim() || currentNote.value.content.trim()) {
    currentNote.value.date = new Date().toISOString()
    
    if (currentNote.value.id) {
      await db.notes.update(currentNote.value.id, {
        title: currentNote.value.title,
        content: currentNote.value.content,
        date: currentNote.value.date
      })
    } else {
      await db.notes.add({
        title: currentNote.value.title,
        content: currentNote.value.content,
        date: currentNote.value.date
      })
    }
    loadNotes()
  }
  isEditing.value = false
}

const deleteNote = async (id) => {
  await db.notes.delete(id)
  loadNotes()
}
</script>
