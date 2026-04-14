import 'jest-extended';
import createDAG, { Identifiable } from '../index';

describe('outgoing adjacency cache', () => {
  test('multiple traverse calls should produce identical results', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };

    dag.addEdge(a, b);
    dag.addEdge(a, c);

    const collectVisits = () => {
      const visited: string[] = [];
      dag.traverse(node => visited.push(node.id), {});
      return visited;
    };

    const first = collectVisits();
    const second = collectVisits();
    const third = collectVisits();

    expect(first).toEqual(second);
    expect(second).toEqual(third);
  });

  test('traverse after interleaved addEdge should reflect new edges', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };

    dag.addEdge(a, b);

    // First traverse — builds cache
    const first: string[] = [];
    dag.traverse(node => first.push(node.id), {});
    expect(first).toEqual(['A', 'B']);

    // Add another edge — should incrementally update cache
    dag.addEdge(a, c);

    // Second traverse — should include the new edge
    const second: string[] = [];
    dag.traverse(node => second.push(node.id), {});
    expect(second).toEqual(['A', 'B', 'C']);
  });

  test('traverse after multiple post-cache addEdge calls is correct', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };
    const d = { id: 'D' };

    dag.addEdge(a, b);

    // Trigger cache build
    const initial: string[] = [];
    dag.traverse(node => initial.push(node.id), {});
    expect(initial).toEqual(['A', 'B']);

    // Add edges incrementally after cache exists
    dag.addEdge(b, c);
    dag.addEdge(c, d);

    const after: string[] = [];
    dag.traverse(node => after.push(node.id), {});
    expect(after).toEqual(['A', 'B', 'C', 'D']);
  });

  test('failed cycle edge should not corrupt the cache', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };

    dag.addEdge(a, b);

    // Build cache
    const before: string[] = [];
    dag.traverse(node => before.push(node.id), {});
    expect(before).toEqual(['A', 'B']);

    // Attempt cycle — should fail without corrupting cache
    expect(() => dag.addEdge(b, a)).toThrow(/cycle/);

    // Cache should still be correct
    const after: string[] = [];
    dag.traverse(node => after.push(node.id), {});
    expect(after).toEqual(['A', 'B']);
  });
});
