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
  constructor(readonly data: T, readonly dependencies = new Set<string>()) {}

  get id(): string {
    return this.data.id;
  }
}

class DAGraph<T extends Identifiable> {
  private readonly nodesById = new Map<string, Node<T>>();

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
      throw new Error(`[${from.id}] -> [${to.id}] form a cycle`);
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
    const dependenciesOf = function* (node: Node<T>): Iterable<T> {
      for (const child of node.dependencies || []) {
        if (!visited.has(child)) {
          yield* dependenciesOf(nodesById.get(child));
          yield nodesById.get(child).data;
          visited.add(child);
        }
      }
    };

    for (const node of nodesById.values()) {
      if (!visited.has(node.id)) {
        yield* dependenciesOf(node);
        yield node.data;
        visited.add(node.id);
      }
    }
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
    const outgoing = new Map<string, string[]>();
    for (const node of this.nodesById.values()) {
      for (const depId of node.dependencies) {
        let children = outgoing.get(depId);
        if (!children) {
          children = [];
          outgoing.set(depId, children);
        }
        children.push(node.id);
      }
    }

    const visitNode = (nodeId: string, parent: T | null, depth: number, index: number, total: number) => {
      const node = this.nodesById.get(nodeId);
      if (!node) {
        return;
      }

      visitor(node.data, { parent, depth, index, total }, context);

      const children = outgoing.get(nodeId) || [];
      children.forEach((childId, i) => {
        visitNode(childId, node.data, depth + 1, i, children.length);
      });
    };

    const roots = [...this.roots()];
    roots.forEach((root, i) => {
      visitNode(root.id, null, 0, i, roots.length);
    });
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

    while (queue.length > 0) {
      const [nodeId] = queue.splice(0, 1);
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

export type { DAGraph, Identifiable, DAGVisitor, TraversalState };
export default createDAG;
export { createDAG };
