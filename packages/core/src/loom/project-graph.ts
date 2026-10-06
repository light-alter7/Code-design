import type { ProjectEdge, ProjectGraphSnapshot, ProjectNode } from './types.js';

export class ProjectGraph {
  private nodes = new Map<string, ProjectNode>();
  private edges: ProjectEdge[] = [];

  upsertNode(node: ProjectNode): void { this.nodes.set(node.id, node); }
  upsertNodes(nodes: ProjectNode[]): void { for (const node of nodes) this.upsertNode(node); }

  link(edge: ProjectEdge): void {
    const exists = this.edges.some((e) => e.from === edge.from && e.to === edge.to && e.relation === edge.relation);
    if (!exists) this.edges.push(edge);
  }

  neighbors(id: string): ProjectNode[] {
    const ids = new Set<string>();
    for (const edge of this.edges) {
      if (edge.from === id) ids.add(edge.to);
      if (edge.to === id) ids.add(edge.from);
    }
    return [...ids].map((nodeId) => this.nodes.get(nodeId)).filter((node): node is ProjectNode => Boolean(node));
  }

  snapshot(): ProjectGraphSnapshot {
    return { version: 1, nodes: [...this.nodes.values()], edges: [...this.edges], updatedAt: new Date().toISOString() };
  }

  load(snapshot: ProjectGraphSnapshot): void {
    this.nodes.clear();
    this.edges = [];
    this.upsertNodes(snapshot.nodes);
    for (const edge of snapshot.edges) this.link(edge);
  }
}
