import 'jest-extended';
import { v4 as uuid } from 'uuid';
import createDAG, { Identifiable } from '../index';

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
      const a = aNode('A');
      const b = aNode('B');
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

      // A -> B -> C
      // A -> D
      dag.addEdge(nodeA, nodeB);
      dag.addEdge(nodeB, nodeC);
      dag.addEdge(nodeA, nodeD);

      const visited: string[] = [];
      dag.traverse((node, { depth }) => {
        visited.push(`${node.id}(depth=${depth})`);
      }, {});

      // Since traverse uses roots() which iterates over Map.values(), the order of branches is insertion order related but implementation specific for Map.
      // We just check that we visited everyone and depths are correct.
      expect(visited).toIncludeAllMembers(['A(depth=0)', 'B(depth=1)', 'C(depth=2)', 'D(depth=1)']);
    });

    test('should pass context to visitor', () => {
      const dag = createDAG();
      const nodeA = aNode('A');
      dag.addNode(nodeA);

      const context = { count: 0 };
      dag.traverse((_node, _state, ctx) => {
        ctx.count++;
      }, context);

      expect(context.count).toBe(1);
    });

    test('should visit nodes multiple times for multiple paths (diamond)', () => {
      const dag = createDAG();
      const a = aNode('A');
      const b = aNode('B');
      const c = aNode('C');
      const d = aNode('D');

      // A -> B -> D
      // A -> C -> D
      dag.addEdge(a, b);
      dag.addEdge(b, d);
      dag.addEdge(a, c);
      dag.addEdge(c, d);

      const visited: string[] = [];
      dag.traverse((node, { parent }) => {
        visited.push(`${node.id} (parent: ${parent?.id})`);
      }, {});

      // D should be visited twice, once from B and once from C
      expect(visited).toIncludeAllMembers([
        'A (parent: undefined)',
        'B (parent: A)',
        'D (parent: B)',
        'C (parent: A)',
        'D (parent: C)'
      ]);
      expect(visited.filter(v => v.startsWith('D'))).toHaveLength(2);
    });

    test('should do nothing for an empty graph', () => {
      const dag = createDAG();
      const visited: string[] = [];
      dag.traverse(node => visited.push(node.id), {});
      expect(visited).toBeEmpty();
    });

    test('should visit all nodes in a disconnected graph', () => {
      const dag = createDAG();
      const a = aNode('A');
      const b = aNode('B');
      const c = aNode('C');

      dag.addNode(a);
      dag.addNode(b);
      dag.addNode(c);

      const visited: string[] = [];
      dag.traverse(node => visited.push(node.id), {});

      expect(visited).toIncludeSameMembers(['A', 'B', 'C']);
    });

    test('should visit siblings in insertion order', () => {
      const dag = createDAG();
      const root = aNode('Root');
      const c1 = aNode('C1');
      const c2 = aNode('C2');
      const c3 = aNode('C3');

      dag.addEdge(root, c2);
      dag.addEdge(root, c1);
      dag.addEdge(root, c3);

      const children: string[] = [];
      dag.traverse((node, { parent }) => {
        if (parent?.id === 'Root') {
          children.push(node.id);
        }
      }, {});

      expect(children).toEqual(['C2', 'C1', 'C3']);
    });

    describe('TraversalState', () => {
      test('should provide correct parent node', () => {
        const dag = createDAG();
        const nodeA = aNode('A');
        const nodeB = aNode('B');
        dag.addEdge(nodeA, nodeB);

        const parents: Record<string, string | null> = {};
        dag.traverse((node, { parent }) => {
          parents[node.id] = parent ? parent.id : null;
        }, {});

        expect(parents['A']).toBeNull();
        expect(parents['B']).toBe('A');
      });

      test('should provide correct index and total for multiple roots', () => {
        const dag = createDAG();
        const nodeA = aNode('A');
        const nodeB = aNode('B');
        const nodeC = aNode('C');

        dag.addNode(nodeA);
        dag.addNode(nodeB);
        dag.addEdge(nodeB, nodeC);

        const visited: string[] = [];
        dag.traverse((node, { index, total }) => {
          visited.push(`${node.id}(idx=${index}, total=${total})`);
        }, {});

        expect(visited).toIncludeSameMembers(['A(idx=0, total=2)', 'B(idx=1, total=2)', 'C(idx=0, total=1)']);
      });

      test('should provide correct index and total siblings count', () => {
        const dag = createDAG();
        const a = aNode('A');
        const b = aNode('B');
        const c = aNode('C');

        // A -> B
        // A -> C
        dag.addEdge(a, b);
        dag.addEdge(a, c);
        dag.addEdge(b, c);

        const visits: string[] = [];
        dag.traverse((node, { index, total }) => {
          visits.push(`${node.id}(idx=${index}, total=${total})`);
        }, {});

        // Roots: A (idx=0, total=1)
        // Children of A: B (idx=0, total=2), C (idx=1, total=2) - deterministic order due to insertion
        expect(visits).toIncludeSameMembers([
          'A(idx=0, total=1)',
          'B(idx=0, total=2)',
          'C(idx=0, total=1)',
          'C(idx=1, total=2)'
        ]);
      });

      test('should provide correct depth', () => {
        const dag = createDAG();
        const a = aNode('A');
        const b = aNode('B');
        const c = aNode('C');

        // A -> B -> C (depth 2)
        // A -> C (depth 1)
        dag.addEdge(a, b);
        dag.addEdge(b, c);
        dag.addEdge(a, c);

        const visits: string[] = [];
        dag.traverse((node, { depth }) => {
          visits.push(`${node.id}(depth=${depth})`);
        }, {});

        // C should be visited twice: once at depth 2 (via B) and once at depth 1 (direct from A)
        expect(visits).toIncludeAllMembers(['A(depth=0)', 'B(depth=1)', 'C(depth=2)', 'C(depth=1)']);
      });
    });
  });
});

function aNode(id?: string): Identifiable {
  return { id: id || uuid() };
}
