import neo4j from 'neo4j-driver';
import { Node } from '../types/Node';

// Initialize Neo4j driver
export const initializeNeo4jDriver = () => {
  const uri = import.meta.env.VITE_NEO4J_URI;
  const user = import.meta.env.VITE_NEO4J_USERNAME;
  const password = import.meta.env.VITE_NEO4J_PASSWORD;
  return neo4j.driver(uri, neo4j.auth.basic(user, password));
};

// Function to load mind map data from Neo4j
export const loadMindMapData = async (driver: any): Promise<Node> => {
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
      return buildNodeTreeFromNeo4jData(mainNode, relationships, childNodes);
    } else {
      // If no data, initialize with a default node
      return {
        id: 'root',
        content: 'My Mindmap',
        parent: null,
        children: [],
      };
    }
  } catch (error) {
    console.error('Failed to load data from Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
};

// Function to build the node tree from Neo4j data
const buildNodeTreeFromNeo4jData = (
  mainNodeData: any,
  relationships: any[],
  childNodes: any[]
): Node => {
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
};

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