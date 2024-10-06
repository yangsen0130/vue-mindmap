export interface Node {
  id: string;
  content: string;
  parent: Node | null;
  children: Node[];
  isCollapsed: boolean;
}