<!-- src/App.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <div class="flex-1 flex">
      <OutlineEditor v-model="rootNode" class="w-1/2 border-r"/>
      <MindMap :rootNode="rootNode" class="w-1/2"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OutlineEditor from './components/OutlineEditor.vue';
import MindMap from './components/MindMap.vue';
import { Node } from './types/Node';

// Initialize the root node
const rootNode = ref<Node>({
  id: 'root',
  content: 'My Mindmap',
  parent: null,
  children: [],
});
</script>

<style>
/* Optional global styles */
</style>