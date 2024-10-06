<!-- src/components/OutlineEditor.vue -->

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
import { v4 as uuidv4 } from 'uuid';
import { Node } from '../types/Node';
import OutlineNode from './OutlineNode.vue';
import { useMindMapStore } from '../store/mindmap';

const mindmapStore = useMindMapStore();

// Use the store's rootNode
const currentMindMapNode = ref(mindmapStore.rootNode);

const dataLoadingError = ref<string | null>(null);

// Inject Neo4j driver and functions
const neo4jDriver = inject('neo4jDriver') as any;
const addChildNodeInNeo4j = inject('addChildNodeInNeo4j') as typeof import('../services/neo4jService').addChildNodeInNeo4j;

// Watch for changes in the store's rootNode
watch(
  () => mindmapStore.rootNode,
  (newVal) => {
    currentMindMapNode.value = newVal;
  }
);

// Function to add a child node and persist it to Neo4j
const addChildNodeToParent = async (parentNode: Node) => {
  try {
    const newNode: Node = {
      id: uuidv4(),
      content: 'New Node',
      parent: parentNode,
      children: [],
      isCollapsed: false,
    };
    parentNode.children.push(newNode);
    await addChildNodeInNeo4j(neo4jDriver, parentNode, newNode);
    mindmapStore.addNodeToMap(newNode);
    console.log('Added child node:', newNode);  
  } catch (err) {
    dataLoadingError.value = 'Failed to add child node.';
    console.error(err);
  }
};
</script>

<style scoped>
/* Optional scoped styles */
</style>