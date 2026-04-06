<template>
  <div class="h-10 w-full flex items-center justify-between px-7 pt-2 pb-1 text-xs font-semibold text-white/90 z-50 backdrop-blur-md bg-black/20">
    <!-- Time -->
    <div class="flex items-center">
      <span>{{ time }}</span>
    </div>

    <!-- RAM Monitor Widget -->
    <div class="absolute left-1/2 -translate-x-1/2 -ml-7 flex items-center bg-white/10 rounded-full px-2.5 py-0.5 text-[9px] tracking-wider border border-white/20 font-mono shadow-sm">
      RAM: {{ (kernel.dynamicUsedRAM / 1024).toFixed(1) }} GB / {{ (kernel.totalRAM / 1024).toFixed(1) }} GB
    </div>

    <!-- Battery & Signal -->
    <div class="flex items-center gap-2">
      <!-- Signal -->
      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M2 22h20V2L2 22z" />
      </svg>
      
      <!-- WiFi -->
      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 21L23.6 6.5C23.1 6.1 18.6 3 12 3C5.4 3 0.9 6.1 0.4 6.5L12 21Z" />
      </svg>

      <!-- Battery -->
      <div class="flex items-center gap-0.5">
        <span>100%</span>
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17 4h-3V2h-4v2H7v18h10V4z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useKernelStore } from '../store/kernel'

const kernel = useKernelStore()
const time = ref('')
let timer

const updateTime = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
