<!-- src/components/MindMap.vue -->
<template>
  <div class="p-4 relative" ref="mindmapContainer">
    <svg :width="width" :height="height">
      <!-- Render connections -->
      <path
        v-for="(conn, index) in connections"
        :key="index"
        :d="conn.d"
        stroke="black"
        fill="transparent"
      />

      <!-- Render nodes -->
      <g v-for="node in allNodes" :key="node.id">
        <rect
          :x="node.x"
          :y="node.y"
          :width="nodeWidth"
          :height="nodeHeight"
          fill="lightblue"
          stroke="black"
        />
        <text
          :x="node.x + nodeWidth / 2"
          :y="node.y + nodeHeight / 2"
          text-anchor="middle"
          alignment-baseline="middle"
        >
          {{ node.content }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Node } from '../types/Node';

const props = defineProps({
  rootNode: {
    type: Object as () => Node,
    required: true,
  },
});

// Dimensions
const nodeWidth = 100;
const nodeHeight = 50;
const horizontalSpacing = 150;
const verticalSpacing = 100;

// Canvas dimensions
const width = ref(800);
const height = ref(600);

const mindmapContainer = ref<HTMLElement>();

const allNodes = ref<any[]>([]);
const connections = ref<any[]>([]);

// Function to compute positions
const computePositions = () => {
  allNodes.value = [];
  connections.value = [];

  const traverse = (node: Node, depth: number, xOffset: number, yOffset: number) => {
    const x = xOffset;
    const y = yOffset;

    allNodes.value.push({
      id: node.id,
      content: node.content,
      x,
      y,
    });

    let childXOffset = x - ((node.children.length - 1) * (nodeWidth + horizontalSpacing)) / 2;

    node.children.forEach((child) => {
      // Draw connection
      connections.value.push({
        d: `M${x + nodeWidth / 2},${y + nodeHeight} 
            C${x + nodeWidth / 2},${y + nodeHeight + verticalSpacing / 2} 
            ${childXOffset + nodeWidth / 2},${y + nodeHeight + verticalSpacing / 2} 
            ${childXOffset + nodeWidth / 2},${y + nodeHeight + verticalSpacing}`,
      });

      // Recursively position child nodes
      traverse(child, depth + 1, childXOffset, y + nodeHeight + verticalSpacing);

      childXOffset += nodeWidth + horizontalSpacing;
    });
  };

  traverse(props.rootNode, 0, width.value / 2 - nodeWidth / 2, 20);
};

// Watch for changes in rootNode
watch(
  () => props.rootNode,
  () => {
    computePositions();
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  if (mindmapContainer.value) {
    const rect = mindmapContainer.value.getBoundingClientRect();
    width.value = rect.width;
    computePositions();
  }
});
</script>

<style scoped>
/* Optional scoped styles */
</style>