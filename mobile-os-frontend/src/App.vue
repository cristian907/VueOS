<template>
  <div class="min-h-screen w-full bg-slate-900 flex items-center justify-center p-0 sm:p-8">
    
    <!-- Mobile Device Container (simulates the phone) -->
    <div 
      class="relative w-full h-[100dvh] sm:w-[375px] sm:h-[812px] sm:rounded-[40px] overflow-hidden flex flex-col bg-slate-900 shadow-2xl sm:ring-8 ring-slate-800 transition-all"
    >
      <!-- Wallpaper Background -->
      <div class="absolute inset-0 z-0">
        <!-- A beautiful dynamic-looking CSS gradient wallpaper -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90 blur-sm mix-blend-overlay"></div>
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div class="absolute top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <!-- OS Status Bar -->
      <StatusBar />

      <!-- Main Desktop Area -->
      <div class="flex-1 z-10 px-4 pt-10 relative">
        
        <!-- App Grid -->
        <div class="grid grid-cols-4 gap-y-6 gap-x-2">
          <DesktopIcon 
            name="Calculadora" 
            color="#f97316"
            @click="handleOpenApp({ id: 'calc', name: 'Calculadora', ramRequired: 1 })"
          >
            <span class="text-white text-2xl font-bold">±</span>
          </DesktopIcon>

          <DesktopIcon 
            name="Contactos" 
            color="#22c55e"
            @click="handleOpenApp({ id: 'contacts', name: 'App de Contactos', ramRequired: 2 })"
          >
            <!-- User Icon SVG -->
            <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </DesktopIcon>
          
          <DesktopIcon 
            name="Teléfono" 
            color="#3b82f6"
            @click="handleOpenApp({ id: 'phone', name: 'Teléfono', ramRequired: 2 })"
          >
            <!-- Phone Icon SVG -->
            <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </DesktopIcon>

          <DesktopIcon 
            name="Mensajes" 
            color="#a855f7"
            @click="handleOpenApp({ id: 'messages', name: 'App de Mensajes', ramRequired: 2 })"
          >
            <!-- Chat Icon SVG -->
            <svg class="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </DesktopIcon>
        </div>

      </div>

      <!-- Dock / Bottom Area -->
      <div class="h-24 z-10 w-full flex items-center justify-center pb-4">
         <div class="h-1.5 w-1/3 bg-white/50 rounded-full"></div> <!-- Home Indicator -->
      </div>

    </div>
  </div>
</template>

<script setup>
import { useKernelStore } from './store/kernel'
import StatusBar from './components/StatusBar.vue'
import DesktopIcon from './components/DesktopIcon.vue'

const kernel = useKernelStore()

const handleOpenApp = (app) => {
  // Try to open the app via the Pinia Kernel
  const success = kernel.openApp(app)
  if(success) {
    console.log(`Aplicación abierta: ${app.name}`)
    // Aquí implementaremos en la Fase 2 el renderizado del componente ventana.
  }
}
</script>

<style>
/* Custom animations for the wallpaper background */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
