// src/services/neo4jService.ts

import neo4j from 'neo4j-driver';
import { Node } from '../types/Node';

// Initialize Neo4j driver
export const initializeNeo4jDriver = () => {
  const uri = import.meta.env.VITE_NEO4J_URI;
  const user = import.meta.env.VITE_NEO4J_USERNAME;
  const password = import.meta.env.VITE_NEO4J_PASSWORD;
  return neo4j.driver(uri, neo4j.auth.basic(user, password));
};

// Note: Removed the loadMindMapData function as data loading is now handled in the Pinia store

// Function to update a node in Neo4j
export const updateNodeInNeo4j = async (driver: any, node: Node): Promise<void> => {
  const session = driver.session();
  try {
    // Update the node content in Neo4j
    await session.run(
      'MATCH (n:MindMapNode {id: $id}) SET n.content = $content',
      { id: node.id, content: node.content }
    );
  } catch (error) {
    console.error('Failed to update node in Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
};

// Function to add a child node in Neo4j
export const addChildNodeInNeo4j = async (driver: any, parentNode: Node, childNode: Node): Promise<void> => {
  const session = driver.session();
  try {
    // Create the child node and relationship
    await session.run(
      `
      MATCH (p:MindMapNode {id: $parentId})
      CREATE (c:MindMapNode {id: $childId, content: $content})
      CREATE (p)-[:IS_CHILD]->(c)
      `,
      { parentId: parentNode.id, childId: childNode.id, content: childNode.content }
    );
  } catch (error) {
    console.error('Failed to add child node in Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
};

// Function to remove a node in Neo4j
export const removeNodeInNeo4j = async (driver: any, node: Node): Promise<void> => {
  const session = driver.session();
  try {
    // Remove the node and its relationships
    await session.run(
      'MATCH (n:MindMapNode {id: $id}) DETACH DELETE n',
      { id: node.id }
    );
  } catch (error) {
    console.error('Failed to remove node in Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
};