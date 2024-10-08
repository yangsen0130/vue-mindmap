<template>
    <g @click.stop="onNodeClick">
      <rect
        :x="node.x"
        :y="node.y"
        :width="nodeWidth"
        :height="nodeHeight"
        fill="lightblue"
        stroke="black"
      />
      <!-- Collapse/Expand Circle -->
      <circle
        v-if="node.children.length > 0"
        :cx="node.x + nodeWidth"
        :cy="node.y + nodeHeight / 2"
        r="5"
        fill="white"
        stroke="black"
        @click.stop="toggleCollapse"
        style="cursor: pointer;"
      />
      <!-- Plus/Minus Sign -->
      <text
        v-if="node.children.length > 0"
        :x="node.x + nodeWidth"
        :y="node.y + nodeHeight / 2 + 3"
        text-anchor="middle"
        alignment-baseline="middle"
        font-size="10"
        @click.stop="toggleCollapse"
        style="cursor: pointer;"
      >
        {{ node.isCollapsed ? '+' : '-' }}
      </text>
      <!-- Editing Input -->
      <template v-if="isEditing">
        <foreignObject
          :x="node.x"
          :y="node.y"
          :width="nodeWidth"
          :height="nodeHeight"
        >
          <input
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            v-model="editingContent"
            @blur="onInputBlur"
            @keypress="onInputKeypress"
            style="width:100%; height:100%; box-sizing:border-box;"
            autofocus
          />
        </foreignObject>
      </template>
      <!-- Display Text -->
      <template v-else>
        <text
          :x="node.x + nodeWidth / 2"
          :y="node.y + nodeHeight / 2"
          text-anchor="middle"
          alignment-baseline="middle"
          style="cursor: pointer;"
        >
          {{ node.content }}
        </text>
      </template>
    </g>
  </template>
  
  <script setup lang="ts">
  import { ref, inject } from 'vue';
  import { Node } from '../types/Node';
  import { useMindMapStore } from '../store/mindmap';
  
  // Props
  const props = defineProps({
    node: {
      type: Object as () => Node & { x: number; y: number },
      required: true,
    },
    nodeWidth: {
      type: Number,
      required: true,
    },
    nodeHeight: {
      type: Number,
      required: true,
    },
  });
  
  const mindmapStore = useMindMapStore();
  
  const isEditing = ref(false);
  const editingContent = ref('');
  
  // Inject Neo4j driver and update function
  const neo4jDriver = inject('neo4jDriver') as any;
  const updateNodeInNeo4j = inject('updateNodeInNeo4j') as typeof import('../services/neo4jService').updateNodeInNeo4j;
  
  // Event handlers
  const onNodeClick = (event: MouseEvent) => {
    event.stopPropagation();
    isEditing.value = true;
    editingContent.value = props.node.content;
  };
  
  const onInputBlur = async () => {
    isEditing.value = false;
    // Update the node content
    if (props.node.content !== editingContent.value) {
      mindmapStore.updateNodeContent(props.node.id, editingContent.value);
  
      // Update in Neo4j
      try {
        await updateNodeInNeo4j(neo4jDriver, props.node);
      } catch (error) {
        console.error('Failed to update node in Neo4j:', error);
      }
    }
  };
  
  const onInputKeypress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };
  
  // Toggle collapse state
  const toggleCollapse = async (event: MouseEvent) => {
    event.stopPropagation();
    const newCollapseState = !props.node.isCollapsed;
    mindmapStore.updateNodeCollapseState(props.node.id, newCollapseState);
  
    try {
      await updateNodeInNeo4j(neo4jDriver, props.node);
      emit('nodeCollapseToggle');
    } catch (error) {
      console.error('Failed to update node collapse state:', error);
    }
  };
  
  const emit = defineEmits(['nodeCollapseToggle']);
  </script>
  
  <style scoped>
  /* Optional scoped styles */
  </style>