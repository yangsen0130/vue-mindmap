<template>
  <li class="ml-4 mb-2">
    <!-- Content Input -->
    <div class="flex items-center">
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
    <ul>
      <OutlineNode
        v-for="child in currentMindMapNode.children"
        :key="child.id"
        :currentMindMapNode="child"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { Node } from '../types/Node';
import { ref, inject } from 'vue';
import OutlineNode from './OutlineNode.vue';

const props = defineProps({
  currentMindMapNode: {
    type: Object as () => Node,
    required: true,
  },
});

const error = ref<string | null>(null);

// Local reference to the node
const currentMindMapNode = ref(props.currentMindMapNode);

// Inject Neo4j driver and functions
const neo4jDriver = inject('neo4jDriver') as any;
const updateNodeInNeo4j = inject('updateNodeInNeo4j') as typeof import('../services/neo4jService').updateNodeInNeo4j;
const addChildNodeInNeo4j = inject('addChildNodeInNeo4j') as typeof import('../services/neo4jService').addChildNodeInNeo4j;
const removeNodeInNeo4j = inject('removeNodeInNeo4j') as typeof import('../services/neo4jService').removeNodeInNeo4j;

// Update node content
const updateNodeContentInDatabase = async () => {
  try {
    await updateNodeInNeo4j(neo4jDriver, currentMindMapNode.value);
  } catch (err) {
    error.value = 'Failed to update node.';
    console.error(err);
  }
};

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
        await removeNodeInNeo4j(neo4jDriver, currentNode);
      }
    }
  } catch (err) {
    error.value = 'Failed to remove node.';
    console.error(err);
  }
};
</script>