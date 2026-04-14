import 'jest-extended';
import createDAG, { Identifiable } from '../index';

describe('topologicalSort (iterative)', () => {
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

    const sorted = [...dag.topologicalSort()];

    expect(sorted).toHaveLength(depth);
    expect(sorted[0]).toBe(nodes[0]);
    expect(sorted[depth - 1]).toBe(nodes[depth - 1]);
  });

  test('should include all nodes from disconnected components', () => {
    const dag = createDAG<Identifiable>();
    const a = { id: 'A' };
    const b = { id: 'B' };
    const c = { id: 'C' };
    const d = { id: 'D' };

    // Two disconnected components: A->B and C->D
    dag.addEdge(a, b);
    dag.addEdge(c, d);

    const sorted = [...dag.topologicalSort()];

    expect(sorted).toHaveLength(4);
    expect(sorted).toIncludeSameMembers([a, b, c, d]);
    // Within each component, dependency order must hold
    expect(sorted.indexOf(a)).toBeLessThan(sorted.indexOf(b));
    expect(sorted.indexOf(c)).toBeLessThan(sorted.indexOf(d));
  });

  test('should handle wide fan-out', () => {
    const dag = createDAG<Identifiable>();
    const root = { id: 'root' };
    const children: Identifiable[] = [];

    for (let i = 0; i < 100; i++) {
      const child = { id: `child${i}` };
      children.push(child);
      dag.addEdge(root, child);
    }

    const sorted = [...dag.topologicalSort()];

    expect(sorted).toHaveLength(101);
    expect(sorted[0]).toBe(root);
    // All children must come after the root
    for (const child of children) {
      expect(sorted.indexOf(root)).toBeLessThan(sorted.indexOf(child));
    }
  });

  test('should produce valid order for diamond pattern', () => {
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

    const sorted = [...dag.topologicalSort()];

    expect(sorted).toHaveLength(4);
    // Each node appears exactly once
    expect(new Set(sorted.map(n => n.id)).size).toBe(4);
    // Dependency order must hold
    expect(sorted.indexOf(a)).toBeLessThan(sorted.indexOf(b));
    expect(sorted.indexOf(a)).toBeLessThan(sorted.indexOf(c));
    expect(sorted.indexOf(b)).toBeLessThan(sorted.indexOf(d));
    expect(sorted.indexOf(c)).toBeLessThan(sorted.indexOf(d));
  });
});
