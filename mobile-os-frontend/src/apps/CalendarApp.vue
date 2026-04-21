<template>
  <div class="w-full h-full bg-white dark:bg-slate-900 flex flex-col transition-colors overflow-hidden relative">
    <!-- Header -->
    <div class="pt-10 pb-4 px-6 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
      <div>
        <h1 class="text-2xl font-bold text-red-500">{{ currentMonthName }}</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ currentYear }}</p>
      </div>
      <div class="flex gap-2">
         <button @click="changeMonth(-1)" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
         </button>
         <button @click="changeMonth(1)" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
         </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 overflow-y-auto px-4 pb-20">
      <!-- Week Days -->
      <div class="grid grid-cols-7 mb-2">
        <div v-for="day in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="day" class="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
          {{ day }}
        </div>
      </div>

      <!-- Days -->
      <div class="grid grid-cols-7 gap-px bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
        <div 
          v-for="(day, idx) in calendarDays" 
          :key="idx"
          @click="selectDay(day)"
          class="aspect-square bg-white dark:bg-slate-900 flex flex-col items-center justify-center relative cursor-pointer active:bg-gray-50 dark:active:bg-slate-800"
          :class="{ 'opacity-20': !day.isCurrentMonth, 'bg-red-50 dark:bg-red-900/10': isSelected(day) }"
        >
          <div 
            class="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors"
            :class="day.isToday ? 'bg-red-500 text-white font-bold' : (isSelected(day) ? 'text-red-500 font-bold' : 'text-black dark:text-white')"
          >
            {{ day.day }}
          </div>
          <div v-if="hasEvent(day)" class="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></div>
        </div>
      </div>

      <!-- Upcoming Events for Selected Day -->
      <div class="mt-8 space-y-4">
        <div class="flex justify-between items-center px-2">
           <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ selectedDateStr }}</h3>
           <button @click="showAddEvent = true" class="text-red-500 text-sm font-bold active:opacity-50">+ Añadir</button>
        </div>
        
        <div v-if="filteredEvents.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl">
           <p class="text-sm">No hay eventos</p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="event in filteredEvents" :key="event.id" class="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border-l-4 border-red-500 flex justify-between items-center group">
            <div class="flex-1">
              <p class="text-sm font-bold text-black dark:text-white">{{ event.title }}</p>
              <p class="text-xs text-gray-500">{{ event.time || 'Todo el día' }}</p>
            </div>
            <button @click="confirmDeleteEvent(event)" class="opacity-0 group-hover:opacity-100 text-red-500 p-2 active:scale-90 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Agregar Evento -->
    <div v-if="showAddEvent" class="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddEvent = false"></div>
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        <div class="p-6">
          <h3 class="text-xl font-bold text-black dark:text-white mb-6">Nuevo Evento</h3>
          <div class="space-y-4 mb-8">
            <input v-model="newEventTitle" type="text" placeholder="Título del evento" class="w-full bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            <input v-model="newEventTime" type="time" class="w-full bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div class="flex gap-4">
            <button @click="showAddEvent = false" class="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform">Cancelar</button>
            <button @click="addEvent" class="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-transform">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Borrado Evento -->
    <div v-if="eventToDelete" class="absolute inset-0 z-[60] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="eventToDelete = null"></div>
      <div class="relative w-full max-w-xs bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-6 text-center animate-pop">
         <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
         </div>
         <h3 class="text-lg font-bold text-black dark:text-white mb-2">¿Eliminar Evento?</h3>
         <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">"{{ eventToDelete.title }}" será borrado permanentemente.</p>
         <div class="flex flex-col gap-2">
            <button @click="deleteEvent" class="w-full py-3 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-transform">Eliminar</button>
            <button @click="eventToDelete = null" class="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform">Cancelar</button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../store/db'

const date = ref(new Date())
const selectedDate = ref(new Date())
const events = ref([])
const showAddEvent = ref(false)
const newEventTitle = ref('')
const newEventTime = ref('10:00')
const eventToDelete = ref(null)

const currentMonthName = computed(() => {
  return date.value.toLocaleString('es-ES', { month: 'long' }).toUpperCase()
})
const currentYear = computed(() => date.value.getFullYear())

const selectedDateStr = computed(() => {
  return selectedDate.value.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
})

const changeMonth = (delta) => {
  const newDate = new Date(date.value)
  newDate.setMonth(newDate.getMonth() + delta)
  date.value = newDate
}

const selectDay = (day) => {
  if (!day.isCurrentMonth) return
  const newSelected = new Date(date.value)
  newSelected.setDate(day.day)
  selectedDate.value = newSelected
}

const isSelected = (day) => {
  return day.isCurrentMonth && 
         selectedDate.value.getDate() === day.day && 
         selectedDate.value.getMonth() === date.value.getMonth() && 
         selectedDate.value.getFullYear() === date.value.getFullYear()
}

const calendarDays = computed(() => {
  const year = date.value.getFullYear()
  const month = date.value.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const days = []
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, isToday: false })
  }
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year
    days.push({ day: i, isCurrentMonth: true, isToday })
  }
  const remainingSlots = 42 - days.length
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({ day: i, isCurrentMonth: false, isToday: false })
  }
  return days
})

// --- GESTIÓN DE EVENTOS ---
const loadEvents = async () => {
  events.value = await db.events.toArray()
}

const addEvent = async () => {
  if (!newEventTitle.value.trim()) return
  const eventDate = new Date(selectedDate.value)
  eventDate.setHours(0,0,0,0)
  await db.events.add({
    date: eventDate.toISOString(),
    title: newEventTitle.value,
    time: newEventTime.value
  })
  newEventTitle.value = ''
  showAddEvent.value = false
  loadEvents()
}

const confirmDeleteEvent = (event) => {
  eventToDelete.value = event
}

const deleteEvent = async () => {
  if (eventToDelete.value) {
    await db.events.delete(eventToDelete.value.id)
    eventToDelete.value = null
    loadEvents()
  }
}

const hasEvent = (day) => {
  if (!day.isCurrentMonth) return false
  const dayDate = new Date(date.value)
  dayDate.setDate(day.day)
  dayDate.setHours(0,0,0,0)
  const iso = dayDate.toISOString()
  return events.value.some(e => e.date === iso)
}

const filteredEvents = computed(() => {
  const selectedISO = new Date(selectedDate.value)
  selectedISO.setHours(0,0,0,0)
  const iso = selectedISO.toISOString()
  return events.value.filter(e => e.date === iso).sort((a,b) => a.time.localeCompare(b.time))
})

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
