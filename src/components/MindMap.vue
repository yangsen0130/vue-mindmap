<template>
  <div class="p-4 relative w-full h-full" ref="mindmapContainer">
    <!-- Error State -->
    <div v-if="error" class="text-red-500 mb-2">
      {{ error }}
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center">
      <p>Loading...</p>
    </div>
    <!-- Mind Map -->
    <svg
      v-else
      width="100%"
      height="100%"
      :viewBox="`0 0 ${width} ${height}`"
      @wheel.prevent="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <!-- Apply transformations to this group -->
      <g :transform="`translate(${translateX}, ${translateY}) scale(${scale})`">
        <!-- Render connections -->
        <path
          v-for="(conn, index) in connections"
          :key="index"
          :d="conn.d"
          stroke="black"
          fill="transparent"
        />

        <!-- Render nodes using MindMapNode component -->
        <MindMapNode
          v-for="node in allNodes"
          :key="node.id"
          :node="node"
          :nodeWidth="nodeWidth"
          :nodeHeight="nodeHeight"
          @nodeCollapseToggle="computePositions"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { Node } from '../types/Node';
import { useMindMapStore } from '../store/mindmap';
import MindMapNode from './MindMapNode.vue';

const error = ref<string | null>(null);
const loading = ref(false);

// Dimensions
const nodeWidth = 100;
const nodeHeight = 50;
const horizontalSpacing = 150;
const verticalSpacing = 100;

// Canvas dimensions
const width = ref(800);
const height = ref(600);

const mindmapContainer = ref<HTMLElement>();

interface PositionedNode extends Node {
  x: number;
  y: number;
}

const allNodes = ref<PositionedNode[]>([]);
const connections = ref<any[]>([]);

// Variables for zoom and pan
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const initialTranslateX = ref(0);
const initialTranslateY = ref(0);

// Get the mindmap store
const mindmapStore = useMindMapStore();

// Function to compute positions
const computePositions = () => {
  if (!mindmapStore.rootNode) {
    error.value = 'No root node available.';
    return;
  }

  try {
    loading.value = true;
    allNodes.value = [];
    connections.value = [];

    const visitedNodes = new Set<string>();

    const traverse = (
      node: Node,
      depth: number,
      xOffset: number,
      yOffset: number,
      parentCollapsed: boolean
    ) => {
      if (visitedNodes.has(node.id)) {
        return; // Skip if already visited to avoid duplicates
      }
      visitedNodes.add(node.id);

      if (parentCollapsed) {
        return; // Skip rendering this node if parent is collapsed
      }

      const x = xOffset;
      const y = yOffset;

      // Create a PositionedNode by extending the node
      const positionedNode: PositionedNode = {
        ...node,
        x,
        y,
      };

      allNodes.value.push(positionedNode);

      if (node.isCollapsed) {
        return; // Do not traverse further if node is collapsed
      }

      let childYOffset =
        y - ((node.children.length - 1) * (nodeHeight + verticalSpacing)) / 2;

      node.children.forEach((child) => {
        // Draw connection
        connections.value.push({
          d: `M${x + nodeWidth},${y + nodeHeight / 2} 
              C${x + nodeWidth + horizontalSpacing / 2},${y + nodeHeight / 2} 
              ${x + nodeWidth + horizontalSpacing / 2},${childYOffset + nodeHeight / 2} 
              ${x + nodeWidth + horizontalSpacing},${childYOffset + nodeHeight / 2}`,
        });

        // Recursively position child nodes
        traverse(
          child,
          depth + 1,
          x + nodeWidth + horizontalSpacing,
          childYOffset,
          parentCollapsed || node.isCollapsed
        );

        childYOffset += nodeHeight + verticalSpacing;
      });
    };

    traverse(mindmapStore.rootNode, 0, 20, height.value / 2 - nodeHeight / 2, false);
  } catch (err) {
    error.value = 'Failed to compute mindmap positions.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Event handlers for zoom and pan
const onWheel = (event: WheelEvent) => {
  event.preventDefault();
  const scaleAmount = -event.deltaY * 0.001;
  const newScale = scale.value + scaleAmount;
  scale.value = Math.min(Math.max(newScale, 0.1), 5); // Limit scale between 0.1 and 5
};

const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  initialTranslateX.value = translateX.value;
  initialTranslateY.value = translateY.value;
};

const onMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const dx = event.clientX - dragStartX.value;
    const dy = event.clientY - dragStartY.value;
    translateX.value = initialTranslateX.value + dx;
    translateY.value = initialTranslateY.value + dy;
  }
};

const onMouseUp = () => {
  isDragging.value = false;
};

// Watch for changes in the store's rootNode
watch(
  () => mindmapStore.rootNode,
  () => {
    computePositions();
  },
  { deep: true, immediate: true }
);

const updateDimensions = () => {
  if (mindmapContainer.value) {
    const rect = mindmapContainer.value.getBoundingClientRect();
    width.value = rect.width;
    height.value = rect.height;
    computePositions();
  }
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});
</script>

<style scoped>
.p-4 {
  width: 100%;
  height: 100%;
}

svg {
  overflow: hidden;
  cursor: grab;
}

svg:active {
  cursor: grabbing;
}
</style>