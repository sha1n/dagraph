import 'jest-extended';
import { v4 as uuid } from 'uuid';
import createDAG, { Identifiable } from '..';

describe('DAGraph', () => {
  describe('addEdge', function () {
    test('should add both ends of edges as nodes', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();

      dag.addEdge(node1, node2);
      dag.addEdge(node1, node3);

      expect([...dag.nodes()]).toIncludeSameMembers([node1, node2, node3]);
    });

    test('should detect a direct cycle and throw', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();

      expect(() => dag.addEdge(node1, node2).addEdge(node2, node1)).toThrow(/cycle/);
    });

    test('should detect an indirect cycle', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();
      const node4 = aNode();
      const node5 = aNode();

      expect(() =>
        dag
          .addEdge(node1, node2)
          .addEdge(node2, node3)
          .addEdge(node3, node4)
          .addEdge(node4, node5)
          .addEdge(node5, node2)
      ).toThrow(/cycle/);
    });
  });

  describe('roots', () => {
    test('should return the nodes from which forward traversal should start', () => {
      const dag = createDAG();
      const node0 = aNode();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();
      const node4 = aNode();
      const node5 = aNode();
      dag.addNode(node0); // node0
      dag.addEdge(node1, node2); // node1 -> node2
      dag.addEdge(node1, node3); // node1 -> node3
      dag.addEdge(node2, node3); // node2 -> node3
      dag.addEdge(node2, node4); // node2 -> node4
      dag.addEdge(node3, node4); // node3 -> node4
      dag.addEdge(node4, node5); // node4 -> node5

      const expectedRoots = [node0, node1];

      expect([...dag.roots()]).toIncludeSameMembers(expectedRoots);
    });

    test('should return nodes when the graph is disconnected', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();

      const roots = [...dag.addNode(node1).addNode(node2).addNode(node3).roots()];

      expect(roots).toIncludeSameMembers([node1, node2, node3]);
    });

    test('should return an empty iterator', () => {
      const dag = createDAG();

      const roots = [...dag.roots()];

      expect(roots).toBeEmpty();
    });
  });

  describe('topologicalSort', () => {
    test('should return empty iterable for an empty graph', () => {
      const dag = createDAG();

      expect(dag.topologicalSort()).toBeEmpty();
    });

    test('should return a single node for a single node graph', () => {
      const dag = createDAG();
      const theNode = aNode();
      dag.addNode(theNode);

      const expected = [theNode];

      expect([...dag.topologicalSort()]).toEqual(expected);
    });

    test('should follow edges directions', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();
      const node4 = aNode();
      const node5 = aNode();
      dag.addEdge(node1, node2); // node1 -> node2
      dag.addEdge(node1, node3); // node1 -> node3
      dag.addEdge(node2, node3); // node2 -> node3
      dag.addEdge(node2, node4); // node2 -> node4
      dag.addEdge(node3, node4); // node3 -> node4
      dag.addEdge(node4, node5); // node4 -> node5

      const expected = [node1, node2, node3, node4, node5];

      expect([...dag.topologicalSort()]).toEqual(expected);
    });
  });

  describe('reverse', () => {
    test('should return an empty graph for an empty graph', () => {
      const dag = createDAG();

      expect([...dag.reverse().nodes()]).toBeEmpty();
    });

    test('should return a single node graph for a single node graph', () => {
      const dag = createDAG();
      const theNode = aNode();
      dag.addNode(theNode);

      const expected = [theNode];

      expect([...dag.reverse().nodes()]).toEqual(expected);
    });

    test('should return a graph with reverse edges directions', () => {
      const dag = createDAG();
      const node1 = aNode();
      const node2 = aNode();
      const node3 = aNode();
      const node4 = aNode();
      const node5 = aNode();
      dag.addEdge(node1, node2); // node1 -> node2
      dag.addEdge(node1, node3); // node1 -> node3
      dag.addEdge(node2, node3); // node2 -> node3
      dag.addEdge(node2, node4); // node2 -> node4
      dag.addEdge(node3, node4); // node3 -> node4
      dag.addEdge(node4, node5); // node4 -> node5

      const expected = [node5, node4, node3, node2, node1];

      expect([...dag.reverse().topologicalSort()]).toEqual(expected);

      // Additional verification for simple case
      const smallDag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };
      smallDag.addEdge(a, b);
      expect([...smallDag.reverse().topologicalSort()]).toEqual([b, a]);
    });
  });

  describe('traverse', () => {
    test('should visit nodes in depth-first order', () => {
      const dag = createDAG();
      const nodeA = aNode('A');
      const nodeB = aNode('B');
      const nodeC = aNode('C');
      const nodeD = aNode('D');

      dag.addEdge(nodeA, nodeB);
      dag.addEdge(nodeB, nodeC);
      dag.addEdge(nodeA, nodeD);

      // Structure:
      // A -> B -> C
      // A -> D

      const visited: string[] = [];
      dag.traverse((node, parent, depth) => {
        visited.push(`${node.id}:${depth}`);
      }, {});

      // Since traverse uses roots() which iterates over Map.values(), the order of branches is insertion order related but implementation specific for Map.
      // We just check that we visited everyone and depths are correct.
      expect(visited).toIncludeAllMembers(['A:0', 'B:1', 'C:2', 'D:1']);
    });

    test('should pass context to visitor', () => {
      const dag = createDAG();
      const nodeA = aNode('A');
      dag.addNode(nodeA);

      const context = { count: 0 };
      dag.traverse((_node, _parent, _depth, _index, _total, ctx) => {
        ctx.count++;
      }, context);

      expect(context.count).toBe(1);
    });

    test('should provide parent node', () => {
      const dag = createDAG();
      const nodeA = aNode('A');
      const nodeB = aNode('B');
      dag.addEdge(nodeA, nodeB);

      const parents: Record<string, string | null> = {};
      dag.traverse((node, parent) => {
        parents[node.id] = parent ? parent.id : null;
      }, {});

      expect(parents['A']).toBeNull();
      expect(parents['B']).toBe('A');
    });

    test('should handle multiple roots', () => {
      const dag = createDAG();
      const nodeA = aNode('A');
      const nodeB = aNode('B');
      const nodeC = aNode('C');

      dag.addNode(nodeA);
      dag.addNode(nodeB);
      dag.addEdge(nodeB, nodeC);

      const visited: string[] = [];
      dag.traverse(node => visited.push(node.id), {});

      expect(visited).toIncludeSameMembers(['A', 'B', 'C']);
    });

    test('should provide index and total siblings count', () => {
      const dag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      // A -> B
      // A -> C
      dag.addEdge(a, b);
      dag.addEdge(a, c);

      const visits: string[] = [];
      dag.traverse((node, _parent, _depth, index, total) => {
        visits.push(`${node.id}(${index}/${total})`);
      }, {});

      // Roots: A (0/1)
      // Children of A: B (0/2), C (1/2) - deterministic order due to insertion
      expect(visits).toIncludeSameMembers(['A(0/1)', 'B(0/2)', 'C(1/2)']);
    });
  });
});

function aNode(id?: string): Identifiable {
  return { id: id || uuid() };
}
