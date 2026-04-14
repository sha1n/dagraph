import 'jest-extended';
import createDAG, { Identifiable } from '../index';

describe('DAGConfig', () => {
  describe('default (on-add cycle detection)', () => {
    test('should detect and reject cycles', () => {
      const dag = createDAG<Identifiable>();
      const a = { id: 'A' };
      const b = { id: 'B' };

      dag.addEdge(a, b);

      expect(() => dag.addEdge(b, a)).toThrow(/cycle/);
    });
  });

  describe('manual cycle detection', () => {
    test('should allow adding cycle-forming edges without throwing', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };

      dag.addEdge(a, b);

      expect(() => dag.addEdge(b, a)).not.toThrow();
    });

    test('isAcyclic should return false on a cyclic graph', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };

      dag.addEdge(a, b);
      dag.addEdge(b, a);

      expect(dag.isAcyclic()).toBe(false);
    });

    test('isAcyclic should return true on a valid acyclic graph', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      dag.addEdge(a, b);
      dag.addEdge(b, c);

      expect(dag.isAcyclic()).toBe(true);
    });

    test('valid manual-mode graph should work with traverse', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      dag.addEdge(a, b);
      dag.addEdge(a, c);

      const visited: string[] = [];
      dag.traverse(node => visited.push(node.id), {});

      expect(visited).toEqual(['A', 'B', 'C']);
    });

    test('valid manual-mode graph should work with topologicalSort', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      dag.addEdge(a, b);
      dag.addEdge(b, c);

      expect([...dag.topologicalSort()]).toEqual([a, b, c]);
    });

    test('valid manual-mode graph should work with roots', () => {
      const dag = createDAG<Identifiable>({ cycleDetection: 'manual' });
      const a = { id: 'A' };
      const b = { id: 'B' };

      dag.addEdge(a, b);

      expect([...dag.roots()]).toEqual([a]);
    });
  });
});
