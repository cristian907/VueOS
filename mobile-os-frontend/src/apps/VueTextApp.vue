<template>
  <div class="w-full h-full flex flex-col bg-white dark:bg-slate-900 transition-colors relative">
    <!-- PANTALLA DE BLOQUEO / CONFIGURACIÓN -->
    <div v-if="!hasNumber" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      </div>
      <h2 class="text-2xl font-bold text-black dark:text-white mb-3">Bienvenido a VueText</h2>
      <p class="text-neutral-500 dark:text-slate-400 mb-8">Para usar el servicio de mensajería en la red P2P, debes configurar tu Número Virtual.</p>
      
      <button 
        @click="goToSettings"
        class="bg-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
      >
        Ir a Ajustes
      </button>
    </div>

    <!-- PANTALLA PRINCIPAL DE CHATS -->
    <div v-else-if="!activeChat" class="flex-1 flex flex-col h-full">
      <div class="pt-5 pb-3 px-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center shrink-0">
        <h1 class="text-3xl font-bold text-black dark:text-white">Mensajes</h1>
        <div class="flex items-center gap-3">
          <!-- Indicador de conexión -->
          <div 
            class="w-3 h-3 rounded-full" 
            :class="network.isRegistered ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'"
          ></div>
          <button @click="showContactsModal = true" class="text-blue-500 active:scale-90 transition-transform">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
        </div>
      </div>

      <!-- Alerta de Error de Red -->
      <div v-if="network.connectionError" class="bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 text-sm text-center">
        {{ network.connectionError }}
      </div>
      <div v-else-if="!network.isConnected" class="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 p-2 text-xs text-center font-medium">
        Conectando a la red...
      </div>

      <!-- Lista de Conversaciones -->
      <div class="flex-1 overflow-y-auto px-5 py-2 space-y-1">
        <div v-if="conversations.length === 0" class="text-center text-neutral-400 mt-10">
          No tienes mensajes.
        </div>
        <div 
          v-for="conv in conversations" 
          :key="conv.number"
          class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0 active:bg-gray-50 dark:active:bg-slate-800/50 -mx-5 px-5 transition-colors cursor-pointer group"
        >
          <!-- Buscar nombre en agenda si existe, sino usar inicial del numero -->
          <div @click="openChat(conv.number)" class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
            {{ getContactAvatar(conv.number) }}
          </div>
          <div @click="openChat(conv.number)" class="flex-1 overflow-hidden">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-black dark:text-white text-lg truncate">{{ getContactName(conv.number) }}</h3>
              <!-- Punto de notificación -->
              <div v-if="network.unreadCounts[conv.number]" class="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] shrink-0"></div>
            </div>
            <p class="text-neutral-500 dark:text-slate-400 text-sm truncate flex items-center gap-1" :class="network.unreadCounts[conv.number] ? 'font-bold text-black dark:text-white' : ''">
              <span v-if="conv.lastSender === settings.phoneNumber" class="text-blue-500 shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </span>
              <span v-if="conv.isPhoto" class="flex items-center gap-1 opacity-70">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span class="italic">Imagen</span>
              </span>
              <span v-else>{{ conv.lastMessage }}</span>
            </p>
          </div>
          <!-- Delete button in list -->
          <button @click.stop="confirmDeleteChat(conv.number)" class="text-red-400 dark:text-red-500 p-2 shrink-0 opacity-70 hover:opacity-100 active:scale-90 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- PANTALLA DE CHAT ACTIVO -->
    <div v-else class="flex-1 flex flex-col h-full bg-neutral-50 dark:bg-slate-900">
      <!-- Header -->
      <div class="pt-5 pb-3 px-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 shrink-0 z-10">
        <button @click="closeChat" class="text-blue-500 flex items-center -ml-2 active:opacity-70 transition-opacity">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div class="flex items-center gap-2 flex-1 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            {{ getContactAvatar(activeChat) }}
          </div>
          <div class="flex flex-col overflow-hidden">
            <h2 class="font-semibold text-black dark:text-white leading-tight truncate">{{ getContactName(activeChat) }}</h2>
            
            <!-- Botón añadir si no está guardado -->
            <div v-if="!isContact(activeChat)" class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-neutral-500 font-mono">{{ formatPhone(activeChat) }}</span>
              <button @click.stop="openQuickAddContact(activeChat)" class="text-[10px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full active:scale-95 transition-transform shrink-0">
                + Añadir
              </button>
            </div>
            <!-- Solo el numero formateado si sí está guardado -->
            <span v-else class="text-xs text-neutral-500 font-mono">{{ formatPhone(activeChat) }}</span>
          </div>
        </div>
        
        <button @click="confirmDeleteChat(activeChat)" class="text-red-500 p-2 active:scale-90 transition-transform shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      <!-- Mensajes -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" ref="messagesContainer">
        <div 
          v-for="msg in currentMessages" 
          :key="msg.id"
          class="max-w-[80%] flex flex-col"
          :class="msg.sender === settings.phoneNumber ? 'self-end items-end' : 'self-start items-start'"
        >
          <!-- Imagen -->
          <template v-if="msg.blob">
            <div :class="msg.sender === settings.phoneNumber ? 'rounded-2xl rounded-br-sm overflow-hidden' : 'rounded-2xl rounded-bl-sm overflow-hidden'">
              <img 
                :src="blobUrl(msg.blob)" 
                class="max-w-[220px] max-h-[280px] object-cover cursor-pointer block"
                @click="previewImage(msg.blob)"
              />
            </div>
          </template>
          <!-- Texto o texto+imagen -->
          <div v-if="msg.text"
            class="px-4 py-2 rounded-2xl flex flex-col mt-0.5"
            :class="msg.sender === settings.phoneNumber ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-200 dark:bg-slate-700 text-black dark:text-white rounded-bl-sm'"
          >
            <span class="text-[15px] leading-snug break-words">{{ msg.text }}</span>
          </div>
          <span class="text-[10px] mt-1 opacity-50 text-gray-500 dark:text-gray-400">
            {{ new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
          </span>
        </div>
      </div>

      <!-- Input Area -->
      <div class="px-3 pt-3 pb-8 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shrink-0">
        <!-- Menú adjuntar (si está abierto) -->
        <div v-if="showAttachMenu" class="flex gap-3 mb-2 justify-start px-1">
          <button @click="openCameraOverlay" class="flex flex-col items-center gap-1 text-blue-500 active:scale-90 transition-transform">
            <div class="w-11 h-11 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Cámara</span>
          </button>
          <button @click="openGalleryOverlay" class="flex flex-col items-center gap-1 text-purple-500 active:scale-90 transition-transform">
            <div class="w-11 h-11 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Galería</span>
          </button>
          <button @click="triggerFile" class="flex flex-col items-center gap-1 text-gray-500 active:scale-90 transition-transform">
            <div class="w-11 h-11 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </div>
            <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Archivo</span>
          </button>
        </div>
        <!-- Row de input -->
        <div class="flex items-end gap-2">
          <button @click="showAttachMenu = !showAttachMenu" class="w-10 h-10 mb-0.5 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center shrink-0 active:scale-90 transition-all text-gray-500 dark:text-gray-300"
            :class="showAttachMenu ? 'rotate-45 bg-red-100 dark:bg-red-900/30 text-red-500' : ''"
          >
            <svg class="w-5 h-5 transition-transform" :style="showAttachMenu ? 'transform: rotate(45deg)' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <div class="flex-1 bg-neutral-100 dark:bg-slate-700 rounded-2xl border border-transparent dark:border-slate-600 focus-within:border-blue-500 overflow-hidden px-4 py-2 flex items-center min-h-[44px]">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendChat"
              type="text" 
              placeholder="Mensaje" 
              class="w-full bg-transparent text-black dark:text-white focus:outline-none"
            />
          </div>
          <button 
            @click="sendChat" 
            :disabled="!newMessage.trim() || !network.isRegistered"
            class="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:scale-100 active:scale-95 transition-all"
          >
            <svg class="w-5 h-5 ml-1 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
        <!-- Inputs ocultos (al final, siempre renderizados) -->
      </div>
    </div>

    <!-- MODAL DE CONTACTOS -->
    <div v-if="showContactsModal" class="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-slide-up">
      <div class="pt-5 pb-3 px-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
        <button @click="showContactsModal = false" class="text-blue-500 flex items-center -ml-2 active:opacity-70 transition-opacity">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 class="font-bold text-xl text-black dark:text-white flex-1">Nuevo Mensaje</h2>
      </div>
      
      <!-- Buscador -->
      <div class="p-3 bg-gray-50 dark:bg-slate-800/50 shrink-0">
        <div class="bg-gray-200 dark:bg-slate-700 rounded-xl px-3 py-2 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            v-model="searchQuery" 
            @input="handleSearchInput"
            type="text" 
            inputmode="search"
            placeholder="Nombre o número (ej: 0414...)" 
            class="w-full bg-transparent text-black dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <!-- Lista de Resultados -->
      <div class="flex-1 overflow-y-auto px-4">
        <!-- Opcion rapida para numeros tipeados directos -->
        <div 
          v-if="isTypingNumber" 
          @click="startNewChat(searchQuery)"
          class="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-slate-800 cursor-pointer active:bg-gray-50 dark:active:bg-slate-800/50"
        >
          <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <div>
            <h3 class="font-semibold text-black dark:text-white">Escribir a: <span class="font-mono text-blue-500">{{ formatPhone(searchQuery) }}</span></h3>
            <p class="text-sm text-neutral-500">Enviar mensaje directo</p>
          </div>
        </div>

        <!-- Resultados de la agenda -->
        <div v-if="filteredContacts.length > 0">
          <div class="text-xs font-bold text-gray-400 uppercase mt-4 mb-2">Tus Contactos</div>
          <div 
            v-for="contact in filteredContacts" 
            :key="contact.id"
            @click="startNewChat(contact.id)"
            class="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-slate-800 cursor-pointer active:bg-gray-50 dark:active:bg-slate-800/50"
          >
            <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {{ contact.avatar }}
            </div>
            <div>
              <h3 class="font-semibold text-black dark:text-white">{{ contact.name }}</h3>
              <p class="text-neutral-500 dark:text-slate-400 text-xs font-mono">{{ formatPhone(contact.id) }}</p>
            </div>
          </div>
        </div>
        
        <div v-else-if="!isTypingNumber && searchQuery" class="text-center text-gray-400 mt-10">
          No se encontraron contactos
        </div>
      </div>
    </div>

    <!-- MODAL DE GUARDAR CONTACTO RAPIDO -->
    <div v-if="quickAddNumber" class="absolute inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
      <div class="bg-white dark:bg-slate-800 w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in transition-colors">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-black dark:text-white">Añadir Contacto</h2>
          <button @click="closeQuickAdd" class="text-blue-500 font-semibold">Cancelar</button>
        </div>
        
        <div v-if="quickAddError" class="mb-4 bg-red-100/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in">
          {{ quickAddError }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Número</label>
            <input :value="formatPhone(quickAddNumber)" disabled type="text" class="w-full bg-gray-200 dark:bg-slate-900 text-gray-500 dark:text-gray-400 p-3 rounded-xl font-mono text-lg opacity-80 cursor-not-allowed">
          </div>
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Nombre</label>
            <input v-model="quickAddFirstName" type="text" class="w-full bg-gray-100 dark:bg-slate-700 text-black dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Nombre">
          </div>
          <div>
            <label class="block text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Apellido</label>
            <input v-model="quickAddLastName" type="text" class="w-full bg-gray-100 dark:bg-slate-700 text-black dark:text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg" placeholder="Apellido">
          </div>
          <button @click="saveQuickAdd" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 mt-4 active:scale-95 transition-transform">
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE ELIMINAR CHAT -->
    <div v-if="chatToDelete" class="absolute inset-0 z-50 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center animate-slide-up sm:animate-fade-in transition-colors">
        <h3 class="text-xl font-bold text-black dark:text-white mb-2">Eliminar Conversación</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">¿Estás seguro de que deseas borrar toda la conversación? Esta acción no se puede deshacer.</p>
        <div class="flex gap-3">
          <button @click="chatToDelete = null" class="flex-1 bg-gray-200 dark:bg-slate-700 text-black dark:text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">Cancelar</button>
          <button @click="executeDeleteChat" class="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- VISOR DE IMAGEN COMPLETO -->
    <div v-if="previewBlob" class="absolute inset-0 z-[80] bg-black flex flex-col" @click="previewBlob = null">
      <div class="absolute top-4 right-4 z-10">
        <button @click.stop="previewBlob = null" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-4">
        <img :src="blobUrl(previewBlob)" class="max-w-full max-h-full object-contain rounded-lg" @click.stop />
      </div>
    </div>

    <!-- OVERLAY: CÁMARA INTEGRADA -->
    <div v-if="showCameraOverlay" class="absolute inset-0 z-[90] bg-black flex flex-col">
      <div class="absolute top-4 left-4 z-20">
        <button @click="closeCameraOverlay" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <!-- Visor -->
      <div class="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video ref="camVideo" autoplay playsinline class="w-full h-full object-cover" :class="camFacing === 'user' ? '-scale-x-100' : ''"></video>
        <div v-if="camFlash" class="absolute inset-0 bg-white z-10"></div>
      </div>
      <!-- Controles -->
      <div class="h-32 bg-black flex items-center justify-around px-8 pb-4">
        <!-- Girar cámara -->
        <button @click="toggleCamFacing" class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
        <!-- Disparador -->
        <button @click="captureAndSend" class="w-20 h-20 rounded-full bg-white/30 border-[4px] border-white flex items-center justify-center active:scale-90 transition-transform">
          <div class="w-[66px] h-[66px] bg-white rounded-full"></div>
        </button>
        <div class="w-12 h-12"></div>
      </div>
      <canvas ref="camCanvas" class="hidden"></canvas>
    </div>

    <!-- OVERLAY: GALERIA INTEGRADA -->
    <div v-if="showGalleryOverlay" class="absolute inset-0 z-[90] bg-white dark:bg-black flex flex-col">
      <div class="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-gray-200 dark:border-gray-800">
        <button @click="showGalleryOverlay = false" class="text-blue-500 flex items-center gap-1 active:opacity-70">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          Cancelar
        </button>
        <h2 class="text-lg font-bold text-black dark:text-white">Seleccionar Foto</h2>
      </div>
      <div class="flex-1 overflow-y-auto p-1">
        <div v-if="galleryPhotos.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 mt-10">
          <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p>No hay fotos en la Galería</p>
        </div>
        <div class="grid grid-cols-3 gap-1">
          <div 
            v-for="p in galleryPhotos" 
            :key="p.id"
            @click="sendGalleryPhoto(p.blob)"
            class="aspect-square bg-gray-200 dark:bg-slate-800 cursor-pointer overflow-hidden active:opacity-60 transition-opacity"
          >
            <img :src="p.url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- Solo el input de Archivo queda nativo -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageSelected" />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSettingsStore } from '../store/settings'
import { useKernelStore } from '../store/kernel'
import { useNetworkStore } from '../store/network'
import { useContactsStore } from '../store/contacts'
import { db } from '../store/db'
import { liveQuery } from 'dexie'

const settings = useSettingsStore()
const kernel = useKernelStore()
const network = useNetworkStore()
const contactsStore = useContactsStore()

const hasNumber = computed(() => !!settings.phoneNumber)

const goToSettings = () => {
  kernel.openApp({ id: 'settings', name: 'Ajustes', ramRequired: 512, component: 'settings' })
}

// Helpers para Formateo y Contactos
const formatPhone = (phoneNum) => {
  if (!phoneNum) return ''
  let val = phoneNum.replace(/\D/g, '')
  if (val.length > 4) val = val.substring(0, 4) + '-' + val.substring(4)
  return val
}

const isContact = (phoneNum) => {
  return contactsStore.list.some(c => c.id === phoneNum)
}

const getContactName = (phoneNum) => {
  const contact = contactsStore.list.find(c => c.id === phoneNum)
  return contact ? contact.name : formatPhone(phoneNum)
}
const getContactAvatar = (phoneNum) => {
  const contact = contactsStore.list.find(c => c.id === phoneNum)
  return contact ? contact.avatar : phoneNum.charAt(0)
}

// Lógica de Chats
const activeChat = ref(null)
const conversations = ref([])
const currentMessages = ref([])
const newMessage = ref('')
const messagesContainer = ref(null)

// Adjuntar imágenes
const showAttachMenu = ref(false)
const fileInput = ref(null)
const previewBlob = ref(null)

const blobUrl = (blob) => blob ? URL.createObjectURL(blob) : ''

const previewImage = (blob) => {
  previewBlob.value = blob
}

// ---- Overlay Cámara ----
const showCameraOverlay = ref(false)
const camVideo = ref(null)
const camCanvas = ref(null)
const camFacing = ref('environment')
const camFlash = ref(false)
let camStream = null

const openCameraOverlay = async () => {
  showAttachMenu.value = false
  showCameraOverlay.value = true
  await nextTick()
  await startCamStream()
}

const closeCameraOverlay = () => {
  showCameraOverlay.value = false
  stopCamStream()
}

const startCamStream = async () => {
  stopCamStream()
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: camFacing.value }, audio: false })
    if (camVideo.value) camVideo.value.srcObject = camStream
  } catch (e) { console.error('[Cam]', e) }
}

const stopCamStream = () => {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null }
  if (camVideo.value) camVideo.value.srcObject = null
}

const toggleCamFacing = () => {
  camFacing.value = camFacing.value === 'user' ? 'environment' : 'user'
  startCamStream()
}

const captureAndSend = async () => {
  if (!camStream || !camVideo.value) return
  camFlash.value = true
  setTimeout(() => camFlash.value = false, 120)

  const video = camVideo.value
  const canvas = camCanvas.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (camFacing.value === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Comprimir y enviar
  const base64 = canvas.toDataURL('image/jpeg', 0.78)
  closeCameraOverlay()
  try {
    await network.sendMessage(activeChat.value, '', base64)
  } catch (err) {
    alert('No se pudo enviar: ' + err.message)
  }
}

// ---- Overlay Galería ----
const showGalleryOverlay = ref(false)
const galleryPhotos = ref([])

const openGalleryOverlay = async () => {
  showAttachMenu.value = false
  // Cargar fotos de db.photos
  const records = await db.photos.reverse().toArray()
  galleryPhotos.value = records.map(r => ({ id: r.id, blob: r.blob, url: URL.createObjectURL(r.blob) }))
  showGalleryOverlay.value = true
}

const sendGalleryPhoto = async (blob) => {
  showGalleryOverlay.value = false
  const base64 = await blobToBase64(blob)
  try {
    await network.sendMessage(activeChat.value, '', base64)
  } catch (err) {
    alert('No se pudo enviar: ' + err.message)
  }
}

const blobToBase64 = (blob) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.readAsDataURL(blob)
})

// ---- Solo archivo nativo (sin cámara/galería overlay) ----

const triggerFile = () => {
  showAttachMenu.value = false
  setTimeout(() => fileInput.value?.click(), 50)
}

const compressImage = (file, maxPx = 1024, quality = 0.78) => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round(height * maxPx / width); width = maxPx }
        else { width = Math.round(width * maxPx / height); height = maxPx }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = url
  })
}

const handleImageSelected = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file || !activeChat.value) return
  try {
    const base64 = await compressImage(file)
    await network.sendMessage(activeChat.value, '', base64)
  } catch (err) {
    console.error('[VueText] Error enviando imagen:', err)
    alert('No se pudo enviar la imagen: ' + err.message)
  }
}
const searchQuery = ref('')
const showContactsModal = ref(false)

const handleSearchInput = (e) => {
  let val = e.target.value
  // Si empieza con un número, asumimos que es un teléfono y lo formateamos
  if (/^[\d\-\s]+$/.test(val) || /^\d/.test(val)) {
    let clean = val.replace(/\D/g, '')
    if (clean.length > 11) {
      clean = clean.substring(0, 11)
    }
    if (clean.length > 4) {
      searchQuery.value = clean.substring(0, 4) + '-' + clean.substring(4)
    } else {
      searchQuery.value = clean
    }
  }
}

// Modal Quick Add
const quickAddNumber = ref(null)
const quickAddFirstName = ref('')
const quickAddLastName = ref('')
const quickAddError = ref('')

const openQuickAddContact = (number) => {
  quickAddNumber.value = number
  quickAddFirstName.value = ''
  quickAddLastName.value = ''
  quickAddError.value = ''
}
const closeQuickAdd = () => {
  quickAddNumber.value = null
}
const saveQuickAdd = () => {
  if(!quickAddFirstName.value.trim()) {
    quickAddError.value = 'El nombre es obligatorio.'
    return
  }
  contactsStore.addContact(quickAddFirstName.value.trim(), quickAddLastName.value.trim(), quickAddNumber.value)
  closeQuickAdd()
}

const isTypingNumber = computed(() => {
  const query = searchQuery.value.trim()
  return query.length > 0 && /^[\d\-\s]+$/.test(query)
})

const filteredContacts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return contactsStore.list
  return contactsStore.list.filter(c => 
    c.name.toLowerCase().includes(q) || c.id.includes(q.replace(/\D/g, ''))
  )
})

const chatToDelete = ref(null)

const confirmDeleteChat = (number) => {
  chatToDelete.value = number
}

const executeDeleteChat = async () => {
  if (chatToDelete.value) {
    await db.messages.where('chatWith').equals(chatToDelete.value).delete()
    if (activeChat.value === chatToDelete.value) {
      closeChat()
    }
    chatToDelete.value = null
  }
}

const startNewChat = (inputStr) => {
  // Limpiamos de guiones antes de abrir chat
  const cleanNumber = inputStr.replace(/\D/g, '')
  if (cleanNumber) {
    showContactsModal.value = false
    searchQuery.value = ''
    openChat(cleanNumber)
  }
}

// Observers para IndexedDB
let messagesSubscription = null
let convSubscription = null

onMounted(() => {
  // Observar conversaciones en vivo
  convSubscription = liveQuery(async () => {
    // Obtenemos todos los mensajes y ordenamos manualmente por fecha descendente
    const allMsgs = await db.messages.toArray()
    // Ordenamos por timestamp real para evitar problemas de ordenación de strings
    allMsgs.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    const convMap = new Map()
    for (const msg of allMsgs) {
      if (!convMap.has(msg.chatWith)) {
        convMap.set(msg.chatWith, {
          number: msg.chatWith,
          lastMessage: msg.text,
          lastSender: msg.sender,
          isPhoto: !!msg.blob,
          date: msg.date
        })
      }
    }
    return Array.from(convMap.values())
  }).subscribe(convs => {
    conversations.value = convs
  })
})

const openChat = (number) => {
  activeChat.value = number
  network.clearUnread(number)
  
  if (messagesSubscription) messagesSubscription.unsubscribe()
  
  messagesSubscription = liveQuery(
    async () => {
      const msgs = await db.messages.where('chatWith').equals(number).toArray()
      return msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  ).subscribe(msgs => {
    currentMessages.value = msgs
    scrollToBottom()
  })
}

const closeChat = () => {
  activeChat.value = null
  if (messagesSubscription) {
    messagesSubscription.unsubscribe()
    messagesSubscription = null
  }
}

// Si recibimos un mensaje mientras el chat está abierto Y la app está en primer plano, limpiamos la notificación inmediatamente
watch([() => kernel.foregroundAppId, () => network.unreadCounts[activeChat.value]], ([fgId, count]) => {
  if (fgId === 'vuetext' && activeChat.value && count > 0) {
    network.clearUnread(activeChat.value)
  }
})

const sendChat = async () => {
  const text = newMessage.value.trim()
  if (!text) return
  
  newMessage.value = ''
  showAttachMenu.value = false
  
  try {
    await network.sendMessage(activeChat.value, text, null)
  } catch (err) {
    console.error(err)
    alert('No se pudo enviar el mensaje: ' + err.message)
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 50)
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
