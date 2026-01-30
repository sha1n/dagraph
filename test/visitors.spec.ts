import createDAG, { createIndentFormatter, createTreeAsciiFormatter } from '..';

describe('visitors', () => {
  describe('createPrintVisitor', () => {
    test('should print graph with default indentation', () => {
      const dag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      // A -> B -> C
      dag.addEdge(a, b);
      dag.addEdge(b, c);

      const lines: string[] = [];
      dag.traverse(createIndentFormatter(), lines);

      expect(lines).toEqual(['A', '  B', '    C']);
    });

    test('should support custom indentation', () => {
      const dag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };

      dag.addEdge(a, b);

      const lines: string[] = [];
      dag.traverse(
        createIndentFormatter(n => n.id, '----'),
        lines
      );

      expect(lines).toEqual(['A', '----B']);
    });

    test('should support custom label function', () => {
      const dag = createDAG<{ id: string; val: number }>();
      const a = { id: 'A', val: 1 };
      const b = { id: 'B', val: 2 };

      dag.addEdge(a, b);

      const lines: string[] = [];
      dag.traverse(
        createIndentFormatter(n => `Value: ${n.val}`),
        lines
      );

      expect(lines).toEqual(['Value: 1', '  Value: 2']);
    });
  });

  describe('createTreeVisitor', () => {
    test('should print graph with tree structure', () => {
      const dag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };
      const d = { id: 'D' };
      const e = { id: 'E' };

      // A -> B -> C
      // A -> D -> E
      dag.addEdge(a, b);
      dag.addEdge(b, c);
      dag.addEdge(a, d);
      dag.addEdge(d, e);

      // Roots: A
      // Children of A: B, D (in that order because B added first)

      const lines: string[] = [];
      dag.traverse(createTreeAsciiFormatter(), lines);

      const expected = ['A', '├── B', '│   └── C', '└── D', '    └── E'];

      expect(lines).toEqual(expected);
    });

    test('should handle multiple roots', () => {
      const dag = createDAG();
      const a = { id: 'A' };
      const b = { id: 'B' };
      const c = { id: 'C' };

      dag.addNode(a);
      dag.addNode(b);
      dag.addEdge(b, c);

      // A
      // B -> C

      const lines: string[] = [];
      dag.traverse(createTreeAsciiFormatter(), lines);

      const expected = ['A', 'B', '└── C'];

      expect(lines).toEqual(expected);
    });
  });
});
