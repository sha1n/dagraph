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

      const myDAG = createDAG<MyThing>();
      myDAG.addEdge(
        {
          id: 'a',
          name: 'my thing',
          doSomething: () => {
            console.log('A');
          }
        },
        {
          id: 'b',
          name: 'my other thing',
          doSomething: () => {
            console.log('B');
          }
        }
      );
    });
  });
});

type MyThing = {
  id: string;
  name: string;
  doSomething(): void;
};

function aNode(): Identifiable {
  return { id: uuid() };
}
