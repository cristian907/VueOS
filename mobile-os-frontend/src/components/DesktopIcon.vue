<template>
  <div 
    class="flex flex-col items-center gap-1 cursor-pointer group active:scale-95 transition-transform"
    @click="$emit('click')"
  >
    <!-- Icon Container -->
    <div :style="{ backgroundColor: color }" class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
      <!-- Icon Slot -->
      <slot>
        <span class="text-white text-2xl font-bold">{{ name.charAt(0) }}</span>
      </slot>
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
  }
})
defineEmits(['click'])
</script>
