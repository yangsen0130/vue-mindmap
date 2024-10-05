<template>
  <div class="p-4">
    <!-- Error State -->
    <div v-if="dataLoadingError" class="text-red-500 mb-2">
      {{ dataLoadingError }}
    </div>

    <!-- Title Input -->
    <input
      v-model="currentMindMapNode.content"
      class="w-full text-xl font-bold mb-4 border-b"
      placeholder="Title"
    />

    <!-- Recursive List -->
    <ul>
      <OutlineNode
        v-for="child in currentMindMapNode.children"
        :key="child.id"
        :currentMindMapNode="child"
      />
    </ul>

    <!-- Add Child Button -->
    <button
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      @click="addChildNodeToParent(currentMindMapNode)"
    >
      Add Child
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
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
const currentMindMapNode = ref(props.modelValue);

const dataLoadingError = ref<string | null>(null);

// Inject Neo4j driver and functions
const neo4jDriver = inject('neo4jDriver') as any;
const addChildNodeInNeo4j = inject('addChildNodeInNeo4j') as typeof import('../services/neo4jService').addChildNodeInNeo4j;

// Watch for changes and emit updates
watch(
  () => currentMindMapNode.value,
  (newVal) => {
    emits('update:modelValue', newVal);
  },
  { deep: true }
);

// Function to add a child node and persist it to Neo4j
const addChildNodeToParent = async (parentNode: Node) => {
  try {
    const newNode: Node = {
      id: Date.now().toString(),
      content: 'New Node',
      parent: parentNode,
      children: [],
    };
    parentNode.children.push(newNode);
    await addChildNodeInNeo4j(neo4jDriver, parentNode, newNode);
  } catch (err) {
    dataLoadingError.value = 'Failed to add child node.';
    console.error(err);
  }
};
</script>

<style scoped>
/* Optional scoped styles */
</style>