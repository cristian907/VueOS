<template>
  <div class="w-full h-full bg-white dark:bg-slate-900 flex flex-col transition-colors overflow-hidden relative">
    <!-- Header -->
    <div class="pt-10 pb-5 px-6 flex justify-between items-end">
      <div>
        <p class="text-sm font-semibold text-orange-500 uppercase tracking-wider">{{ activeTabName }}</p>
        <h1 class="text-4xl font-bold text-black dark:text-white">{{ activeTab === 'clock' ? 'Local' : activeTab === 'alarm' ? 'Alarmas' : 'Cronómetro' }}</h1>
      </div>
      <div v-if="activeTab === 'clock'" class="text-right">
        <p class="text-5xl font-light text-black dark:text-white tracking-tighter">{{ currentTime }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6">
      
      <!-- === TAB: RELOJ === -->
      <div v-if="activeTab === 'clock'" class="space-y-6">
        <div class="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4 border border-gray-100 dark:border-slate-800">
          <div class="w-48 h-48 rounded-full border-4 border-gray-200 dark:border-slate-700 relative flex items-center justify-center">
             <div class="w-3 h-3 bg-orange-500 rounded-full z-10"></div>
             <div class="absolute w-1.5 h-12 bg-black dark:bg-white rounded-full origin-bottom bottom-1/2" :style="{ transform: `rotate(${hoursDegrees}deg)` }"></div>
             <div class="absolute w-1 h-16 bg-black dark:bg-white rounded-full origin-bottom bottom-1/2" :style="{ transform: `rotate(${minutesDegrees}deg)` }"></div>
             <div class="absolute w-0.5 h-20 bg-orange-500 rounded-full origin-bottom bottom-1/2" :style="{ transform: `rotate(${secondsDegrees}deg)` }"></div>
             <div v-for="n in 12" :key="n" class="absolute inset-2 text-center" :style="{ transform: `rotate(${n * 30}deg)` }">
               <div class="w-0.5 h-2 bg-gray-300 dark:bg-slate-600 mx-auto"></div>
             </div>
          </div>
        </div>
      </div>

      <!-- === TAB: ALARMA === -->
      <div v-if="activeTab === 'alarm'" class="space-y-4 pb-10">
        <div v-if="alarms.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg class="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p>No hay alarmas configuradas</p>
        </div>

        <div v-for="alarm in alarms" :key="alarm.id" class="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 flex justify-between items-center transition-all">
          <div class="flex gap-4 items-center">
            <button @click="confirmDeleteAlarm(alarm)" class="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full active:scale-90 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
            <div :class="{ 'opacity-40': !alarm.enabled }">
              <p class="text-4xl font-light text-black dark:text-white leading-none">{{ alarm.time }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ alarm.label || 'Alarma' }}</p>
            </div>
          </div>
          <button 
            @click="toggleAlarm(alarm)"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="alarm.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'"
          >
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" :class="alarm.enabled ? 'translate-x-6' : 'translate-x-0'"></div>
          </button>
        </div>
        <button @click="showAddAlarm = true" class="w-full py-4 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl text-gray-400 text-sm font-bold active:scale-95 transition-transform">+ AÑADIR ALARMA</button>
      </div>

      <!-- === TAB: CRONÓMETRO === -->
      <div v-if="activeTab === 'stopwatch'" class="flex flex-col items-center justify-center space-y-8 pt-10">
        <div class="text-7xl font-mono font-thin text-black dark:text-white tracking-tighter">
          {{ stopwatchDisplay }}
        </div>
        
        <div class="flex gap-10">
          <button @click="resetStopwatch" class="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 font-bold active:scale-90 transition-transform">Reset</button>
          <button 
            @click="toggleStopwatch" 
            class="w-20 h-20 rounded-full font-bold active:scale-90 transition-transform"
            :class="stopwatchRunning ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'"
          >
            {{ stopwatchRunning ? 'Stop' : 'Start' }}
          </button>
        </div>

        <div class="w-full space-y-2 max-h-40 overflow-y-auto pr-2">
          <div v-for="(lap, idx) in laps" :key="idx" class="flex justify-between border-b border-gray-100 dark:border-slate-800 py-2">
            <span class="text-sm text-gray-400">Lap {{ laps.length - idx }}</span>
            <span class="text-sm font-mono text-black dark:text-white">{{ lap }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal Agregar Alarma -->
    <div v-if="showAddAlarm" class="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddAlarm = false"></div>
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        <div class="p-6">
          <h3 class="text-xl font-bold text-black dark:text-white mb-6">Nueva Alarma</h3>
          <div class="flex justify-center items-center gap-2 mb-8">
            <input v-model="newAlarmTime" type="time" class="text-4xl font-light bg-gray-100 dark:bg-slate-800 rounded-2xl px-6 py-4 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div class="flex gap-4">
            <button @click="showAddAlarm = false" class="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform">Cancelar</button>
            <button @click="addAlarm" class="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl active:scale-95 transition-transform">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Borrado -->
    <div v-if="alarmToDelete" class="absolute inset-0 z-[60] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="alarmToDelete = null"></div>
      <div class="relative w-full max-w-xs bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-6 text-center animate-pop">
         <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
         </div>
         <h3 class="text-lg font-bold text-black dark:text-white mb-2">¿Eliminar Alarma?</h3>
         <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
         <div class="flex flex-col gap-2">
            <button @click="deleteAlarm" class="w-full py-3 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-transform">Eliminar</button>
            <button @click="alarmToDelete = null" class="w-full py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform">Cancelar</button>
         </div>
      </div>
    </div>

    <!-- Bottom Nav -->
    <div class="h-24 border-t border-gray-100 dark:border-slate-800 flex items-center justify-around px-6 pb-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      <button @click="activeTab = 'clock'" class="flex flex-col items-center gap-1 transition-colors" :class="activeTab === 'clock' ? 'text-orange-500' : 'text-gray-400'">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        <span class="text-[10px] font-bold">Reloj</span>
      </button>
      <button @click="activeTab = 'alarm'" class="flex flex-col items-center gap-1 transition-colors" :class="activeTab === 'alarm' ? 'text-orange-500' : 'text-gray-400'">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span class="text-[10px] font-bold">Alarma</span>
      </button>
      <button @click="activeTab = 'stopwatch'" class="flex flex-col items-center gap-1 transition-colors" :class="activeTab === 'stopwatch' ? 'text-orange-500' : 'text-gray-400'">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span class="text-[10px] font-bold">Cronómetro</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '../store/db'

const activeTab = ref('clock')
const activeTabName = computed(() => {
  if (activeTab.value === 'clock') return 'Reloj Mundial'
  if (activeTab.value === 'alarm') return 'Alarmas'
  return 'Cronómetro'
})

// --- RELOJ ---
const currentTime = ref('')
const currentDate = ref('')
const hoursDegrees = ref(0)
const minutesDegrees = ref(0)
const secondsDegrees = ref(0)

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  currentDate.value = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })
  
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()
  
  secondsDegrees.value = (seconds / 60) * 360
  minutesDegrees.value = ((minutes + seconds/60) / 60) * 360
  hoursDegrees.value = ((hours % 12 + minutes/60) / 12) * 360
}

// --- ALARMAS PERSISTENTES ---
const alarms = ref([])
const showAddAlarm = ref(false)
const newAlarmTime = ref('07:00')
const alarmToDelete = ref(null)

const loadAlarms = async () => {
  alarms.value = await db.alarms.toArray()
}

const addAlarm = async () => {
  await db.alarms.add({
    time: newAlarmTime.value,
    label: 'Alarma',
    enabled: true
  })
  showAddAlarm.value = false
  loadAlarms()
}

const toggleAlarm = async (alarm) => {
  await db.alarms.update(alarm.id, { enabled: !alarm.enabled })
  loadAlarms()
}

const confirmDeleteAlarm = (alarm) => {
  alarmToDelete.value = alarm
}

const deleteAlarm = async () => {
  if (alarmToDelete.value) {
    await db.alarms.delete(alarmToDelete.value.id)
    alarmToDelete.value = null
    loadAlarms()
  }
}

// --- CRONÓMETRO ---
const stopwatchRunning = ref(false)
const stopwatchTime = ref(0) // en ms
const laps = ref([])
let stopwatchInterval

const stopwatchDisplay = computed(() => {
  const totalSeconds = Math.floor(stopwatchTime.value / 1000)
  const ms = Math.floor((stopwatchTime.value % 1000) / 10)
  const secs = totalSeconds % 60
  const mins = Math.floor(totalSeconds / 60)
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
})

const toggleStopwatch = () => {
  if (stopwatchRunning.value) {
    clearInterval(stopwatchInterval)
    laps.value.unshift(stopwatchDisplay.value)
  } else {
    const start = Date.now() - stopwatchTime.value
    stopwatchInterval = setInterval(() => {
      stopwatchTime.value = Date.now() - start
    }, 10)
  }
  stopwatchRunning.value = !stopwatchRunning.value
}

const resetStopwatch = () => {
  clearInterval(stopwatchInterval)
  stopwatchRunning.value = false
  stopwatchTime.value = 0
  laps.value = []
}

let clockTimer
onMounted(() => {
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
  loadAlarms()
})
onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(stopwatchInterval)
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
