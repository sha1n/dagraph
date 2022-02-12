
# DAGraph
A direct acyclic graph implementation

- [DAGraph](#dagraph)
  - [Features](#features)
  - [Usage](#usage)
  - [Install](#install)

## Features
- Hosts your data in the graph structure
- Topological sort traversal generator
- Traverse root nodes generator
- Reverse graph API

## Usage

```ts
import createDAG from '@sha1n/dagraph';

const dag = createDAG();

dag.addNode({id : 'a'});
dag.addEdge({id : 'b'}, {id : 'a'});
dag.addEdge({id : 'c'}, {id : 'a'});
dag.addEdge({id : 'd'}, {id : 'b'});

for (const node of dap.topologicalSort()) {
  ...
}

```

## Install
```bash
yarn install @sha1n/dagraph
```

```bash
npm i @sha1n/dagraph
```