import { Identifiable, DAGVisitor } from '../index';

/**
 * Creates a visitor that accumulates a string representation of the graph structure using indentation.
 *
 * @param labelFn optional function to generate a label for each node. Defaults to node.id.
 * @param indent optional string to use for indentation. Defaults to 2 spaces.
 * @returns a DAGVisitor that pushes lines to the context array.
 */
export function createIndentFormatter<T extends Identifiable>(
  labelFn: (n: T) => string = n => n.id,
  indent = '  '
): DAGVisitor<T, string[]> {
  return (node, { depth }, lines) => {
    lines.push(`${indent.repeat(depth)}${labelFn(node)}`);
  };
}

/**
 * Creates a visitor that accumulates a tree-like string representation of the graph structure
 * using unicode box-drawing characters (├──, └──, │).
 *
 * @param labelFn optional function to generate a label for each node. Defaults to node.id.
 * @returns a DAGVisitor that pushes lines to the context array.
 */
export function createTreeAsciiFormatter<T extends Identifiable>(
  labelFn: (n: T) => string = n => n.id
): DAGVisitor<T, string[]> {
  const isLastChild: boolean[] = [];

  return (node, { depth, index, total }, lines) => {
    const isLast = index === total - 1;
    isLastChild[depth] = isLast;

    let prefix = '';
    if (depth > 0) {
      for (let i = 1; i < depth; i++) {
        prefix += isLastChild[i] ? '    ' : '│   ';
      }

      const connector = isLast ? '└── ' : '├── ';
      lines.push(`${prefix}${connector}${labelFn(node)}`);
    } else {
      lines.push(labelFn(node));
    }
  };
}
