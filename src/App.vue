<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading State -->
    <div v-if="isDataLoading" class="flex-1 flex items-center justify-center">
      <p>Loading...</p>
    </div>
    <!-- Error State -->
    <div v-else-if="dataLoadingError" class="flex-1 flex items-center justify-center text-red-500">
      <p>{{ dataLoadingError }}</p>
    </div>
    <!-- Main Content -->
    <div v-else class="flex-1 flex">
      <OutlineEditor v-model="rootMindMapNode" class="w-1/2 border-r"/>
      <MindMap :rootNode="rootMindMapNode" class="w-1/2"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import OutlineEditor from './components/OutlineEditor.vue';
import MindMap from './components/MindMap.vue';
import { Node } from './types/Node';
import {
  initializeNeo4jDriver,
  loadMindMapData,
  updateNodeInNeo4j,
  addChildNodeInNeo4j,
  removeNodeInNeo4j,
} from './services/neo4jService.ts';

// Initialize state variables
const isDataLoading = ref(true);
const dataLoadingError = ref<string | null>(null);
const rootMindMapNode = ref<Node | null>(null);

// Create Neo4j driver instance
const neo4jDriverInstance = initializeNeo4jDriver();

// Provide driver and data functions to child components
provide('neo4jDriver', neo4jDriverInstance);
provide('updateNodeInNeo4j', updateNodeInNeo4j);
provide('addChildNodeInNeo4j', addChildNodeInNeo4j);
provide('removeNodeInNeo4j', removeNodeInNeo4j);

// Load data when the component is mounted
onMounted(async () => {
  try {
    rootMindMapNode.value = await loadMindMapData(neo4jDriverInstance);
  } catch (err) {
    dataLoadingError.value = 'Failed to load data from Neo4j.';
    console.error(err);
  } finally {
    isDataLoading.value = false;
  }
});
</script>

<style>
/* Optional global styles */
</style>