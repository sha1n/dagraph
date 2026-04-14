import 'jest-extended';
import createDAG, { Identifiable } from '../index';

describe('addEdge rollback on cycle detection', () => {
  test('should leave the graph in a valid acyclic state after a cycle error', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };

    dag.addEdge(a, b);

    expect(() => dag.addEdge(b, a)).toThrow(/cycle/);

    // Graph should still be usable — only the A->B edge should exist
    expect([...dag.topologicalSort()]).toEqual([a, b]);
  });

  test('should allow adding valid edges after a caught cycle error', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };

    dag.addEdge(a, b);

    expect(() => dag.addEdge(b, a)).toThrow(/cycle/);

    // Adding a non-cycling edge should succeed
    dag.addEdge(b, c);

    expect([...dag.topologicalSort()]).toEqual([a, b, c]);
  });

  test('should retain nodes from the failed edge in the graph', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };

    dag.addEdge(a, b);

    // Attempt to add c->a where c is new, then a cycle c->a when a->b->c exists
    dag.addEdge(b, c);
    expect(() => dag.addEdge(c, a)).toThrow(/cycle/);

    // All three nodes should still be in the graph
    expect([...dag.nodes()]).toIncludeSameMembers([a, b, c]);
    // And the valid edges should still work
    expect([...dag.topologicalSort()]).toEqual([a, b, c]);
  });

  test('should handle multiple failed cycle attempts', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };

    dag.addEdge(a, b).addEdge(b, c);

    // Multiple cycle attempts should all fail cleanly
    expect(() => dag.addEdge(c, a)).toThrow(/cycle/);
    expect(() => dag.addEdge(c, b)).toThrow(/cycle/);
    expect(() => dag.addEdge(b, a)).toThrow(/cycle/);

    // Graph should still be intact
    expect([...dag.topologicalSort()]).toEqual([a, b, c]);
  });
});
