<!-- src/components/MindMap.vue -->
<template>
  <div class="p-4 relative" ref="mindmapContainer">
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
      :width="width"
      :height="height"
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

const allNodes = ref<any[]>([]);
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

// Function to compute positions
const computePositions = () => {
  if (!props.rootNode) {
    error.value = 'No root node available.';
    return;
  }

  try {
    loading.value = true;
    allNodes.value = [];
    connections.value = [];

    const traverse = (
      node: Node,
      depth: number,
      xOffset: number,
      yOffset: number
    ) => {
      const x = xOffset;
      const y = yOffset;

      allNodes.value.push({
        id: node.id,
        content: node.content,
        x,
        y,
      });

      let childXOffset =
        x - ((node.children.length - 1) * (nodeWidth + horizontalSpacing)) / 2;

      node.children.forEach((child) => {
        // Draw connection
        connections.value.push({
          d: `M${x + nodeWidth / 2},${y + nodeHeight} 
              C${x + nodeWidth / 2},${y + nodeHeight + verticalSpacing / 2} 
              ${childXOffset + nodeWidth / 2},${y + nodeHeight + verticalSpacing / 2} 
              ${childXOffset + nodeWidth / 2},${y + nodeHeight + verticalSpacing}`,
        });

        // Recursively position child nodes
        traverse(
          child,
          depth + 1,
          childXOffset,
          y + nodeHeight + verticalSpacing
        );

        childXOffset += nodeWidth + horizontalSpacing;
      });
    };

    traverse(props.rootNode, 0, width.value / 2 - nodeWidth / 2, 20);
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
svg {
  overflow: hidden;
  cursor: grab;
}

svg:active {
  cursor: grabbing;
}
</style>