<template>
  <div class="flex-1 z-10 px-4 pt-10 relative">
    <!-- App Grid -->
    <div class="grid grid-cols-4 gap-y-6 gap-x-2">
      <DesktopIcon 
        name="Calculadora" 
        color="#f97316"
        @click="handleOpenApp({ id: 'calc', name: 'Calculadora', ramRequired: 1024, component: 'calc' })"
      >
        <span class="text-white text-2xl font-bold">±</span>
      </DesktopIcon>

      <DesktopIcon 
        name="Notas" 
        color="#eab308"
        @click="handleOpenApp({ id: 'notes', name: 'Notas', ramRequired: 256, component: 'notes' })"
      >
        <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
      </DesktopIcon>

      <DesktopIcon 
        name="Contactos" 
        color="#22c55e"
        @click="handleOpenApp({ id: 'contacts', name: 'Contactos', ramRequired: 2048, component: 'contacts' })"
      >
        <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </DesktopIcon>

      <DesktopIcon 
        name="Fotos" 
        color="#f43f5e"
        @click="handleOpenApp({ id: 'gallery', name: 'Fotos', ramRequired: 1024, component: 'gallery' })"
      >
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      </DesktopIcon>
      
      <DesktopIcon 
        name="Cámara" 
        color="#737373"
        @click="handleOpenApp({ id: 'camera', name: 'Cámara', ramRequired: 3072, component: 'camera' })"
      >
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </DesktopIcon>
      
      <DesktopIcon 
        name="Teléfono" 
        color="#3b82f6"
        @click="handleOpenApp({ id: 'phone', name: 'Teléfono', ramRequired: 2048, component: 'vuecall' })"
      >
         <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      </DesktopIcon>

      <DesktopIcon 
        name="VueText" 
        color="#3b82f6"
        @click="handleOpenApp({ id: 'vuetext', name: 'VueText', ramRequired: 1024, component: 'vuetext' })"
      >
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      </DesktopIcon>

      <DesktopIcon 
        name="Ajustes" 
        color="#6b7280"
        @click="handleOpenApp({ id: 'settings', name: 'Ajustes', ramRequired: 512, component: 'settings' })"
      >
        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </DesktopIcon>
    </div>
  </div>
</template>

<script setup>
import { useKernelStore } from '../../store/kernel'
import DesktopIcon from '../DesktopIcon.vue'

const kernel = useKernelStore()

const handleOpenApp = (app) => {
  if(!app.component) {
    alert('Esta app será desarrollada en las próximas fases.')
    return
  }
  kernel.openApp(app)
}
</script>
