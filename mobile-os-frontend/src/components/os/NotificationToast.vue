<template>
  <div class="fixed top-12 inset-x-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-6">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in store.toasts" 
        :key="toast.id"
        class="max-w-xs w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in slide-in-from-top-4"
        :class="toast.type === 'error' ? 'border-red-500/50' : 'border-blue-500/50'"
      >
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          :class="toast.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'"
        >
          <svg v-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-sm font-medium text-black dark:text-white leading-tight">{{ toast.message }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../../store/notification'
const store = useNotificationStore()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
