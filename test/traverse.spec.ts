import 'jest-extended';
import createDAG, { Identifiable } from '../index';

describe('traverse (iterative)', () => {
  test('should handle a deep chain without stack overflow', () => {
    const dag = createDAG<Identifiable>();
    const depth = 2000;
    const nodes: Identifiable[] = [];

    for (let i = 0; i < depth; i++) {
      nodes.push({ id: `n${i}` });
    }
    for (let i = 0; i < depth - 1; i++) {
      dag.addEdge(nodes[i], nodes[i + 1]);
    }

    const visited: string[] = [];
    dag.traverse(node => {
      visited.push(node.id);
    }, {});

    expect(visited).toHaveLength(depth);
    expect(visited[0]).toBe('n0');
    expect(visited[depth - 1]).toBe(`n${depth - 1}`);
  });

  test('should visit in depth-first order with correct insertion-ordered siblings', () => {
    const dag = createDAG<Identifiable>();
    const root = { id: 'R' };
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };
    const a1 = { id: 'A1' };
    const a2 = { id: 'A2' };

    dag.addEdge(root, a);
    dag.addEdge(root, b);
    dag.addEdge(root, c);
    dag.addEdge(a, a1);
    dag.addEdge(a, a2);

    const visited: string[] = [];
    dag.traverse(node => {
      visited.push(node.id);
    }, {});

    // DFS: R -> A -> A1 -> A2 -> B -> C
    expect(visited).toEqual(['R', 'A', 'A1', 'A2', 'B', 'C']);
  });

  test('should provide correct TraversalState for deep chains', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };
    const d = { id: 'D' };

    dag.addEdge(a, b);
    dag.addEdge(b, c);
    dag.addEdge(c, d);

    const states: Record<string, { parent: string | null; depth: number; index: number; total: number }> = {};
    dag.traverse((node, state) => {
      states[node.id] = {
        parent: state.parent?.id ?? null,
        depth: state.depth,
        index: state.index,
        total: state.total
      };
    }, {});

    expect(states['A']).toEqual({ parent: null, depth: 0, index: 0, total: 1 });
    expect(states['B']).toEqual({ parent: 'A', depth: 1, index: 0, total: 1 });
    expect(states['C']).toEqual({ parent: 'B', depth: 2, index: 0, total: 1 });
    expect(states['D']).toEqual({ parent: 'C', depth: 3, index: 0, total: 1 });
  });

  test('should visit diamond nodes multiple times with correct per-path state', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };
    const d = { id: 'D' };

    // A -> B -> D
    // A -> C -> D
    dag.addEdge(a, b);
    dag.addEdge(b, d);
    dag.addEdge(a, c);
    dag.addEdge(c, d);

    const visits: { id: string; parent: string | null; depth: number }[] = [];
    dag.traverse((node, state) => {
      visits.push({ id: node.id, parent: state.parent?.id ?? null, depth: state.depth });
    }, {});

    // D visited twice: once via B (depth 2), once via C (depth 2)
    const dVisits = visits.filter(v => v.id === 'D');
    expect(dVisits).toHaveLength(2);
    expect(dVisits).toIncludeSameMembers([
      { id: 'D', parent: 'B', depth: 2 },
      { id: 'D', parent: 'C', depth: 2 }
    ]);
  });
});
