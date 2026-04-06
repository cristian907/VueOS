<template>
  <div class="h-full w-full bg-neutral-900 text-white flex flex-col">
    <!-- Display -->
    <div class="flex-1 flex flex-col justify-end items-end p-6 text-6xl font-light overflow-hidden break-all">
      <div v-if="previousVal" class="text-3xl text-neutral-400 mb-2">{{ previousVal }} {{ operator }}</div>
      <div>{{ displayVal }}</div>
    </div>

    <!-- Keypad -->
    <div class="grid grid-cols-4 gap-3 p-4 pb-12 bg-neutral-950 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <!-- Row 1 -->
      <button @click="clear" class="calc-btn bg-neutral-400 text-black">AC</button>
      <button @click="toggleSign" class="calc-btn bg-neutral-400 text-black">±</button>
      <button @click="percent" class="calc-btn bg-neutral-400 text-black">%</button>
      <button @click="setOp('÷')" class="calc-btn bg-amber-500 text-white hover:bg-amber-400">÷</button>

      <!-- Row 2 -->
      <button @click="append('7')" class="calc-btn bg-neutral-800">7</button>
      <button @click="append('8')" class="calc-btn bg-neutral-800">8</button>
      <button @click="append('9')" class="calc-btn bg-neutral-800">9</button>
      <button @click="setOp('×')" class="calc-btn bg-amber-500 text-white hover:bg-amber-400">×</button>

      <!-- Row 3 -->
      <button @click="append('4')" class="calc-btn bg-neutral-800">4</button>
      <button @click="append('5')" class="calc-btn bg-neutral-800">5</button>
      <button @click="append('6')" class="calc-btn bg-neutral-800">6</button>
      <button @click="setOp('-')" class="calc-btn bg-amber-500 text-white hover:bg-amber-400">−</button>

      <!-- Row 4 -->
      <button @click="append('1')" class="calc-btn bg-neutral-800">1</button>
      <button @click="append('2')" class="calc-btn bg-neutral-800">2</button>
      <button @click="append('3')" class="calc-btn bg-neutral-800">3</button>
      <button @click="setOp('+')" class="calc-btn bg-amber-500 text-white hover:bg-amber-400">+</button>

      <!-- Row 5 -->
      <button @click="append('0')" class="calc-btn bg-neutral-800">0</button>
      <button @click="append('.')" class="calc-btn bg-neutral-800">.</button>
      <button @click="deleteDigit" class="calc-btn bg-neutral-800 text-sm">⌫</button>
      <button @click="calculate" class="calc-btn bg-amber-500 text-white hover:bg-amber-400">=</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const displayVal = ref('0')
const previousVal = ref(null)
const operator = ref(null)
const newNumber = ref(false)

const append = (num) => {
  if (displayVal.value === '0' || newNumber.value) {
    displayVal.value = num
    newNumber.value = false
  } else {
    displayVal.value += num
  }
}

const clear = () => {
  displayVal.value = '0'
  previousVal.value = null
  operator.value = null
}

const toggleSign = () => {
  if(displayVal.value !== '0') {
    displayVal.value = displayVal.value.charAt(0) === '-' ? displayVal.value.slice(1) : '-' + displayVal.value
  }
}

const deleteDigit = () => {
  if (newNumber.value || displayVal.value === '0') return
  displayVal.value = displayVal.value.slice(0, -1)
  if (displayVal.value === '' || displayVal.value === '-') {
    displayVal.value = '0'
  }
}

const percent = () => {
  displayVal.value = `${parseFloat(displayVal.value) / 100}`
}

const setOp = (op) => {
  if (operator.value && !newNumber.value) {
    calculate()
  }
  previousVal.value = displayVal.value
  operator.value = op
  newNumber.value = true
}

const calculate = () => {
  if (!operator.value || !previousVal.value) return
  
  const prev = parseFloat(previousVal.value)
  const current = parseFloat(displayVal.value)
  let result = 0
  
  switch(operator.value) {
    case '+': result = prev + current; break;
    case '-': result = prev - current; break;
    case '×': result = prev * current; break;
    case '÷': result = current !== 0 ? prev / current : 'Error'; break;
  }
  
  displayVal.value = `${result}`
  operator.value = null
  previousVal.value = null
  newNumber.value = true
}
</script>

<style scoped>
@reference "../style.css";
.calc-btn {
  @apply aspect-square rounded-full flex items-center justify-center text-3xl transition-transform active:scale-90 font-normal;
}
</style>
