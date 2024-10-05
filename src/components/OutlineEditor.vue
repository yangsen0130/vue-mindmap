<!-- src/components/OutlineEditor.vue -->
<template>
  <div class="p-4">
    <!-- Title Input -->
    <input
      v-model="node.content"
      class="w-full text-xl font-bold mb-4 border-b"
      placeholder="Title"
    />

    <!-- Recursive List -->
    <ul>
      <OutlineNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @updateNode="updateNode"
      />
    </ul>

    <!-- Add Child Button -->
    <button
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      @click="addChild(node)"
    >
      Add Child
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Node } from '../types/Node';
import OutlineNode from './OutlineNode.vue';

const props = defineProps({
  modelValue: {
    type: Object as () => Node,
    required: true,
  },
});

const emits = defineEmits(['update:modelValue']);

// Local copy of the node to enable two-way binding
const node = ref({ ...props.modelValue });

// Watch for changes and emit updates
watch(
  () => node.value,
  (newVal) => {
    emits('update:modelValue', newVal);
  },
  { deep: true }
);

const addChild = (parentNode: Node) => {
  const newNode: Node = {
    id: Date.now().toString(),
    content: 'New Node',
    parent: parentNode,
    children: [],
  };
  parentNode.children.push(newNode);
};

const updateNode = () => {
  emits('update:modelValue', node.value);
};
</script>

<style scoped>
/* Optional scoped styles */
</style>