<!-- src/components/OutlineNode.vue -->
<template>
  <li class="ml-4 mb-2">
    <!-- Content Input -->
    <div class="flex items-center">
      <input
        v-model="node.content"
        class="border-b flex-1"
        @input="updateNode"
      />
      <!-- Add Child Button -->
      <button @click="addChild(node)" class="ml-2 text-blue-500">+</button>
      <!-- Remove Node Button -->
      <button @click="removeNode(node)" class="ml-2 text-red-500">-</button>
    </div>
    <!-- Recursive Children -->
    <ul>
      <OutlineNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @updateNode="updateNode"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { Node } from '../types/Node';
import { ref } from 'vue';

const props = defineProps({
  node: {
    type: Object as () => Node,
    required: true,
  },
});

const emits = defineEmits(['updateNode']);

const node = ref(props.node);

const updateNode = () => {
  emits('updateNode');
};

const addChild = (parentNode: Node) => {
  const newNode: Node = {
    id: Date.now().toString(),
    content: 'New Node',
    parent: parentNode,
    children: [],
  };
  parentNode.children.push(newNode);
  updateNode();
};

const removeNode = (currentNode: Node) => {
  if (currentNode.parent) {
    const index = currentNode.parent.children.findIndex(
      (child) => child.id === currentNode.id
    );
    if (index !== -1) {
      currentNode.parent.children.splice(index, 1);
      updateNode();
    }
  }
};
</script>