interface Identifiable {
  readonly id: string;
}

/**
 * Represents the state of the traversal at the current node.
 */
interface TraversalState<T> {
  /** The parent node from which the current node was reached. Null for root nodes. */
  readonly parent: T | null;
  /** The depth of the current node in the traversal (0 for roots). */
  readonly depth: number;
  /** The index of the current node among its siblings (children of the same parent). */
  readonly index: number;
  /** The total number of siblings (children of the same parent). */
  readonly total: number;
}

/**
 * A visitor function called for each node during traversal.
 *
 * @param node The current node data.
 * @param state The state of the traversal at the current node.
 * @param context The context object passed to traverse.
 */
type DAGVisitor<T, C> = (node: T, state: TraversalState<T>, context: C) => void;

class Node<T extends Identifiable> {
  constructor(
    readonly data: T,
    readonly dependencies = new Set<string>()
  ) {}

  get id(): string {
    return this.data.id;
  }
}

class DAGraph<T extends Identifiable> {
  private readonly nodesById = new Map<string, Node<T>>();
  private outgoingById: Map<string, string[]> | null = null;

  /**
   * Adds the specified identifiable node to the graph.
   */
  addNode(data: T): DAGraph<T> {
    this.ensureNode(data);

    return this;
  }

  /**
   * @returns the data node identified by the specified id if found, else returns undefined.
   */
  getNode(id: string): T | undefined {
    return this.nodesById.get(id)?.data;
  }

  /**
   * Adds an edge pointing from 'from' to 'to'.
   */
  addEdge(from: T, to: T): DAGraph<T> {
    const fromNode = this.ensureNode(from);
    const toNode = this.ensureNode(to);

    toNode.dependencies.add(fromNode.id);

    if (!this.isAcyclic()) {
      toNode.dependencies.delete(fromNode.id);
      throw new Error(`[${from.id}] -> [${to.id}] form a cycle`);
    }

    if (this.outgoingById) {
      let children = this.outgoingById.get(fromNode.id);
      if (!children) {
        children = [];
        this.outgoingById.set(fromNode.id, children);
      }
      children.push(toNode.id);
    }

    return this;
  }

  /**
   * Returns a generator that returns all the nodes in topological order.
   * Implements a depth-first-search algorithm.
   */
  *topologicalSort(): Iterable<T> {
    const nodesById = this.nodesById;
    const visited = new Set<string>();
    const result: T[] = [];

    const ENTER = 0;
    const EXIT = 1;

    for (const node of nodesById.values()) {
      if (visited.has(node.id)) continue;

      const stack: { nodeId: string; action: number }[] = [{ nodeId: node.id, action: ENTER }];

      while (stack.length > 0) {
        const frame = stack.pop();

        if (frame.action === EXIT) {
          if (!visited.has(frame.nodeId)) {
            visited.add(frame.nodeId);
            result.push(nodesById.get(frame.nodeId).data);
          }
          continue;
        }

        if (visited.has(frame.nodeId)) continue;

        stack.push({ nodeId: frame.nodeId, action: EXIT });

        const deps = [...nodesById.get(frame.nodeId).dependencies];
        for (let i = deps.length - 1; i >= 0; i--) {
          if (!visited.has(deps[i])) {
            stack.push({ nodeId: deps[i], action: ENTER });
          }
        }
      }
    }

    yield* result;
  }

  /**
   * A generator that returns the traverse roots of this graph.
   */
  *roots(): Iterable<T> {
    for (const node of this.nodesById.values()) {
      if (node.dependencies.size === 0) {
        yield node.data;
      }
    }
  }

  /**
   * A generator that returns all the nodes in the this graph.
   */
  *nodes(): Iterable<T> {
    for (const node of this.nodesById.values()) {
      yield node.data;
    }
  }

  /**
   * Returns a graph with the same edges pointing in the opposite direction.
   *
   * @returns a DAGraph
   */
  reverse(): DAGraph<T> {
    const reverseGraph = new DAGraph<T>();

    for (const node of this.nodesById.values()) {
      reverseGraph.addNode(node.data);
    }

    for (const node of this.nodesById.values()) {
      for (const dependencyId of node.dependencies) {
        const dependencyNode = reverseGraph.nodesById.get(dependencyId);
        dependencyNode.dependencies.add(node.id);
      }
    }

    return reverseGraph;
  }

  /**
   * Traverses the graph in depth-first order and calls the visitor function for each node.
   * Siblings (nodes sharing the same parent) are visited in the order they were added`.
   *
   * Note: This traversal behaves like a tree expansion. If a node is reachable via multiple paths
   * (e.g., a "diamond" structure), it will be visited multiple times—once for each path reaching it.
   *
   *
   *
   * @param visitor the visitor function to call for each node.
   * @param context the context object to pass to the visitor.
   */
  traverse<C>(visitor: DAGVisitor<T, C>, context: C): void {
    const outgoing = this.getOutgoing();

    type Frame = { nodeId: string; parent: T | null; depth: number; index: number; total: number };
    const stack: Frame[] = [];

    const roots = [...this.roots()];
    for (let i = roots.length - 1; i >= 0; i--) {
      stack.push({ nodeId: roots[i].id, parent: null, depth: 0, index: i, total: roots.length });
    }

    while (stack.length > 0) {
      const { nodeId, parent, depth, index, total } = stack.pop();
      const node = this.nodesById.get(nodeId);
      if (!node) continue;

      visitor(node.data, { parent, depth, index, total }, context);

      const children = outgoing.get(nodeId) || [];
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({
          nodeId: children[i],
          parent: node.data,
          depth: depth + 1,
          index: i,
          total: children.length
        });
      }
    }
  }

  private getOutgoing(): Map<string, string[]> {
    if (!this.outgoingById) {
      this.outgoingById = new Map<string, string[]>();
      for (const node of this.nodesById.values()) {
        for (const depId of node.dependencies) {
          let children = this.outgoingById.get(depId);
          if (!children) {
            children = [];
            this.outgoingById.set(depId, children);
          }
          children.push(node.id);
        }
      }
    }
    return this.outgoingById;
  }

  private ensureNode(data: T): Node<T> {
    let node = this.nodesById.get(data.id);
    if (node) {
      return node;
    }

    node = new Node(data);
    this.nodesById.set(data.id, node);
    return node;
  }

  private isAcyclic(): boolean {
    const degrees = new Map<string, number>();
    this.nodesById.forEach(node => degrees.set(node.id, 0));
    this.nodesById.forEach(node =>
      node.dependencies.forEach(child => {
        degrees.set(child, degrees.get(child) + 1);
      })
    );

    const queue = new Array<string>();
    this.nodesById.forEach(node => {
      if (degrees.get(node.id) === 0) {
        queue.push(node.id);
      }
    });

    let visitedNodeCount = 0;
    let ptr = 0;

    while (ptr < queue.length) {
      const nodeId = queue[ptr++];
      visitedNodeCount += 1;

      this.nodesById.get(nodeId).dependencies.forEach(child => {
        degrees.set(child, degrees.get(child) - 1);
        if (degrees.get(child) === 0) {
          queue.push(child);
        }
      });
    }

    return visitedNodeCount === this.nodesById.size;
  }
}

function createDAG<T extends Identifiable>(): DAGraph<T> {
  return new DAGraph<T>();
}

export * from './lib/formatVisitors';
export type { DAGraph, Identifiable, DAGVisitor, TraversalState };
export default createDAG;
export { createDAG };
