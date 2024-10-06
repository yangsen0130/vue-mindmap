// src/store/mindmap.ts

import { defineStore } from 'pinia';
// import neo4j from 'neo4j-driver';
import { Node } from '../types/Node';

interface MindMapState {
  rootNode: Node | null;
  nodesById: Map<string, Node>;
}

export const useMindMapStore = defineStore('mindmap', {
  state: (): MindMapState => ({
    rootNode: null,
    nodesById: new Map(),
  }),
  actions: {
    async loadMindMapData(driver: any) {
      const session = driver.session();
      try {
        // Query to get the root node and its relationships
        const result = await session.run(`
          MATCH (n:MindMapRoot)
          OPTIONAL MATCH (n)-[r:IS_CHILD*]->(child)
          RETURN n, collect(r), collect(child)
        `);

        if (result.records.length > 0) {
          const record = result.records[0];
          const mainNode = record.get('n');
          const relationships = record.get('collect(r)');
          const childNodes = record.get('collect(child)');

          // Build the node tree
          const rootNode = this.buildNodeTreeFromNeo4jData(mainNode, relationships, childNodes);
          this.setRootNode(rootNode);
        } else {
          // If no data, initialize with a default node
          const rootNode: Node = {
            id: 'root',
            content: 'My Mindmap',
            parent: null,
            children: [],
          };
          this.setRootNode(rootNode);
        }
      } catch (error) {
        console.error('Failed to load data from Neo4j:', error);
        throw error;
      } finally {
        await session.close();
      }
    },
    setRootNode(node: Node) {
      this.rootNode = node;
      this.nodesById = new Map();
      this.addNodeToMap(node);
    },
    addNodeToMap(node: Node) {
      this.nodesById.set(node.id, node);
      node.children.forEach(child => this.addNodeToMap(child));
    },
    buildNodeTreeFromNeo4jData(mainNodeData: any, relationships: any[], childNodes: any[]): Node {
      const nodesMap = new Map<string, Node>();

      // Create Node instances for each node
      [mainNodeData, ...childNodes].forEach((nodeData: any) => {
        nodesMap.set(nodeData.elementId, {
          id: nodeData.properties.id,
          content: nodeData.properties.content,
          parent: null,
          children: [],
        });
      });

      // Build relationships
      relationships.forEach((relChain: any) => {
        relChain.forEach((relationship: any) => {
          const parentId = relationship.startNodeElementId;
          const childId = relationship.endNodeElementId;
          const parentNode = nodesMap.get(parentId);
          const childNode = nodesMap.get(childId);
          if (parentNode && childNode) {
            childNode.parent = parentNode;
            parentNode.children.push(childNode);
          }
        });
      });

      // Return the root node
      return nodesMap.get(mainNodeData.elementId) as Node;
    },
  },
});