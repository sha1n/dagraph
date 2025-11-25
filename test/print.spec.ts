import 'jest-extended';
import createDAG from '../index';

describe('DAGraph.print', () => {
  test('should print a simple tree structure', () => {
    const dag = createDAG<{ id: string }>();
    dag.addEdge({ id: 'A' }, { id: 'B' });
    dag.addEdge({ id: 'B' }, { id: 'C' });
    dag.addEdge({ id: 'A' }, { id: 'D' });

    // A -> B -> C
    //   -> D

    const output = dag.print();
    const expected = ['A', '├── B', '│   └── C', '└── D'].join('\n');

    expect(output).toBe(expected);
  });

  test('should handle multiple roots', () => {
    const dag = createDAG<{ id: string }>();
    dag.addEdge({ id: 'A' }, { id: 'C' });
    dag.addEdge({ id: 'B' }, { id: 'C' });

    // A -> C
    // B -> C

    const output = dag.print();
    const expected = ['A', '└── C', 'B', '└── C'].join('\n');

    expect(output).toBe(expected);
  });

  test('should use custom label function', () => {
    const dag = createDAG<{ id: string; name: string }>();
    dag.addEdge({ id: '1', name: 'First' }, { id: '2', name: 'Second' });

    const output = dag.print(n => n.name);
    const expected = ['First', '└── Second'].join('\n');

    expect(output).toBe(expected);
  });

  test('should handle disconnected nodes', () => {
    const dag = createDAG<{ id: string }>();
    dag.addNode({ id: 'A' });
    dag.addNode({ id: 'B' });

    const output = dag.print();
    const expected = ['A', 'B'].join('\n');

    expect(output).toBe(expected);
  });
});
