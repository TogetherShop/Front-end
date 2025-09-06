<template>
  <div class="select-box" @click="toggleDropdown">
    <div class="text-container">{{ selected || placeholder }}</div>
    <i class="fa-solid fa-chevron-down keyboard-arrow-down"></i>

    <div v-if="open" class="dropdown">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="dropdown-item"
        @click.stop="selectOption(option)"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: '선택하세요' },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const selected = ref(props.modelValue)

const toggleDropdown = () => {
  open.value = !open.value
}

const selectOption = (option) => {
  selected.value = option
  emit('update:modelValue', option)
  open.value = false
}
</script>

<style scoped>
.select-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d0d5db;
  border-radius: 8px;
  height: 46px;
  padding: 0 12px;
  cursor: pointer;
  background-color: #fff;
}

.text-container {
  font-size: 16px;
  color: #495565;
}

.keyboard-arrow-down {
  font-size: 16px;
  color: #697282;
}

.dropdown {
  position: absolute;
  top: 50px;
  left: 0;
  width: 100%;
  border: 1px solid #d0d5db;
  border-radius: 8px;
  background-color: #fff;
  z-index: 10;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>
