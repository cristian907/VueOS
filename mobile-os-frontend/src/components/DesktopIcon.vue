<template>
  <div 
    class="flex flex-col items-center gap-1 cursor-pointer group active:scale-95 transition-transform"
    @click="$emit('click')"
  >
    <!-- Icon Container -->
    <div :style="{ backgroundColor: color }" class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow relative">
      <!-- Icon Slot -->
      <slot>
        <span class="text-white text-2xl font-bold">{{ name.charAt(0) }}</span>
      </slot>
      <!-- Notification Badge -->
      <div v-if="badge" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 shadow-sm z-10"></div>
    </div>
    <!-- Label -->
    <span class="text-[11px] text-white font-medium drop-shadow-md text-center leading-tight tracking-wide">
      {{ name }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3b82f6' // Default blue
  },
  badge: {
    type: [Number, Boolean],
    default: false
  }
})
defineEmits(['click'])
</script>
