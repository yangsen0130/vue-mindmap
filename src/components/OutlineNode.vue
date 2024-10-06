<template>
  <li class="ml-4 mb-2">
    <!-- Content Input -->
    <div class="flex items-center">
      <!-- Toggle button -->
      <button v-if="currentMindMapNode.children.length > 0" @click="toggleCollapse" class="mr-2">
        <span v-if="currentMindMapNode.isCollapsed">►</span>
        <span v-else>▼</span>
      </button>
      <input
        v-model="currentMindMapNode.content"
        class="border-b flex-1"
        @input="updateNodeContentInDatabase"
      />
      <!-- Add Child Button -->
      <button @click="addChildNodeToParent(currentMindMapNode)" class="ml-2 text-blue-500">+</button>
      <!-- Remove Node Button -->
      <button @click="removeNodeFromParent(currentMindMapNode)" class="ml-2 text-red-500">-</button>
    </div>
    <!-- Recursive Children -->
    <ul v-if="!currentMindMapNode.isCollapsed && !renderedNodeIds.has(currentMindMapNode.id)">
      <OutlineNode
        v-for="child in currentMindMapNode.children"
        :key="child.id"
        :currentMindMapNode="child"
        :renderedNodeIds="new Set([...renderedNodeIds, currentMindMapNode.id])"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { Node } from '../types/Node';
import { ref, inject } from 'vue';
import { useMindMapStore } from '../store/mindmap';
import { v4 as uuidv4 } from 'uuid';
import { reactive } from 'vue';

const props = defineProps({
  currentMindMapNode: {
    type: Object as () => Node,
    required: true,
  },
  renderedNodeIds: {
    type: Object as () => Set<string>,
    default: () => new Set(),
  },
});

const error = ref<string | null>(null);

// Inject Neo4j driver and functions
const neo4jDriver = inject('neo4jDriver') as any;
const updateNodeInNeo4j = inject('updateNodeInNeo4j') as typeof import('../services/neo4jService').updateNodeInNeo4j;
const addChildNodeInNeo4j = inject('addChildNodeInNeo4j') as typeof import('../services/neo4jService').addChildNodeInNeo4j;
const removeNodeInNeo4j = inject('removeNodeInNeo4j') as typeof import('../services/neo4jService').removeNodeInNeo4j;

const mindmapStore = useMindMapStore();

// Update node content
const updateNodeContentInDatabase = async () => {
  try {
    await updateNodeInNeo4j(neo4jDriver, props.currentMindMapNode);
  } catch (err) {
    error.value = 'Failed to update node.';
    console.error(err);
  }
};

const addChildNodeToParent = async (parentNode: Node) => {
  try {
    const newNode: Node = reactive({
      id: uuidv4(),
      content: 'New Node',
      parent: parentNode,
      children: [],
      isCollapsed: false,
    });
    parentNode.children.push(newNode);
    await addChildNodeInNeo4j(neo4jDriver, parentNode, newNode);
    mindmapStore.addNodeToMap(newNode);
  } catch (err) {
    error.value = 'Failed to add child node.';
    console.error(err);
  }
};

const removeNodeFromParent = async (currentNode: Node) => {
  try {
    if (currentNode.parent) {
      const index = currentNode.parent.children.findIndex(
        (child) => child.id === currentNode.id
      );
      if (index !== -1) {
        currentNode.parent.children.splice(index, 1);
        mindmapStore.nodesById.delete(currentNode.id);
        await removeNodeInNeo4j(neo4jDriver, currentNode);
      }
    }
  } catch (err) {
    error.value = 'Failed to remove node.';
    console.error(err);
  }
};

// Toggle collapse state
const toggleCollapse = async () => {
  props.currentMindMapNode.isCollapsed = !props.currentMindMapNode.isCollapsed;
  try {
    await updateNodeInNeo4j(neo4jDriver, props.currentMindMapNode);
  } catch (err) {
    error.value = 'Failed to update node state.';
    console.error(err);
  }
};
</script>