<template>
  <div class="min-h-screen flex relative">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Loading State -->
      <div v-if="isDataLoading" class="flex-1 flex items-center justify-center">
        <p>Loading...</p>
      </div>
      <!-- Error State -->
      <div
        v-else-if="dataLoadingError"
        class="flex-1 flex items-center justify-center text-red-500"
      >
        <p>{{ dataLoadingError }}</p>
      </div>
      <!-- Mind Map Content -->
      <div v-else class="flex-1 flex">
        <!-- Conditional rendering based on mode -->
        <OutlineEditor
          v-if="mode === 'outline' || mode === 'both'"
          v-model="rootMindMapNode"
          :class="mode === 'both' ? 'w-1/2 border-r' : 'w-full'"
        />
        <MindMap
          v-if="mode === 'mindmap' || mode === 'both'"
          :rootNode="rootMindMapNode"
          :class="mode === 'both' ? 'w-1/2' : 'w-full'"
        />
      </div>
    </div>

    <!-- Mode Switcher -->
    <div class="fixed bottom-4 right-4 z-50">
      <div class="bg-white shadow-lg rounded p-3">
        <label class="block mb-2 font-bold">View Mode:</label>
        <div class="flex space-x-2">
          <button
            :class="mode === 'outline' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1 rounded"
            @click="mode = 'outline'"
          >
            Outline
          </button>
          <button
            :class="mode === 'mindmap' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1 rounded"
            @click="mode = 'mindmap'"
          >
            Mind Map
          </button>
          <button
            :class="mode === 'both' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1 rounded"
            @click="mode = 'both'"
          >
            Both
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue';
import OutlineEditor from '../components/OutlineEditor.vue';
import MindMap from '../components/MindMap.vue';
import { Node } from '../types/Node';
import {
  initializeNeo4jDriver,
  loadMindMapData,
  updateNodeInNeo4j,
  addChildNodeInNeo4j,
  removeNodeInNeo4j,
} from '../services/neo4jService.ts';
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router';

// Initialize state variables
const isDataLoading = ref(true);
const dataLoadingError = ref<string | null>(null);
const rootMindMapNode = ref<Node | null>(null);
const mode = ref('both'); // Possible values: 'outline', 'mindmap', 'both'

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

// Logout function
const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);

const logout = () => {
  userStore.clearUser();
  router.push('/login');
};
</script>

<style scoped>
/* Optional scoped styles */
</style>