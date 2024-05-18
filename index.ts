interface Identifiable {
  readonly id: string;
}

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
      for (const dependency of node.dependencies) {
        const depData = this.nodesById.get(dependency).data;
        reverseGraph.addNode(depData);
        reverseGraph.addEdge(node.data, depData);
      }
    }

    return reverseGraph;
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

export type { DAGraph, Identifiable };
export default createDAG;
export { createDAG };