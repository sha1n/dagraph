[![CI](https://github.com/sha1n/dagraph/actions/workflows/ci.yml/badge.svg)](https://github.com/sha1n/dagraph/actions/workflows/ci.yml)
[![Coverage](https://github.com/sha1n/dagraph/actions/workflows/coverage.yml/badge.svg)](https://github.com/sha1n/dagraph/actions/workflows/coverage.yml)
[![codecov](https://codecov.io/gh/sha1n/dagraph/graph/badge.svg?token=TO3WOMYR2U)](https://codecov.io/gh/sha1n/dagraph)
![GitHub](https://img.shields.io/github/license/sha1n/dagraph)
![npm type definitions](https://img.shields.io/npm/types/@sha1n/dagraph)
![npm](https://img.shields.io/npm/v/@sha1n/dagraph)

# DAGraph
A directed acyclic graph (DAG) implementation in TypeScript.

- [DAGraph](#dagraph)
  - [Features](#features)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Custom Objects](#custom-objects)
  - [Install](#install)
  - [Development](#development)

## Features
- **Generic Graph Structure**: Store any identifiable data in the graph.
- **Topological Sort**: Iterate over nodes in topological order (dependencies first).
- **Cycle Detection**: Automatically detects and prevents cycles when adding edges.
- **Root Traversal**: Efficiently access all root nodes (nodes with no dependencies).
- **Graph Reversal**: Create a new graph with all edges reversed.
- **Depth-First Traversal**: Visit nodes with context, parent, depth, and index information.
- **TypeScript**: Written in TypeScript with full type definitions.

## Usage

### Basic 

```ts
import createDAG from '@sha1n/dagraph';

const dag = createDAG();

dag.addNode({id : 'a'});
dag.addEdge({id : 'b'}, {id : 'a'}); // b -> a
dag.addEdge({id : 'c'}, {id : 'a'}); // c -> a
dag.addEdge({id : 'd'}, {id : 'b'}); // d -> b

// Topological sort
for (const node of dag.topologicalSort()) {
  console.log(node.id);
}
```

### Custom Objects
Any object implementing the `Identifiable` interface (having an `id: string` property) can be stored.

```ts
import { createDAG, Identifiable } from '@sha1n/dagraph';

type MyThing = {
  id: string; 
  name: string;
  doSomething(): void;
};

const myThing: MyThing = {
    id: 'a',
    name: 'my thing',
    doSomething: () => {
      console.log('A');
    }
  };

const myOtherThing: MyThing = {
    id: 'b',
    name: 'my other thing',
    doSomething: () => {
      console.log('B');
    }
  };

const myDAG = createDAG<MyThing>();

// Add nodes explicitly or implicitly via addEdge
myDAG.addEdge(myThing, myOtherThing); // myThing -> myOtherThing
```

## Install

Using **pnpm** (recommended):
```bash
pnpm add @sha1n/dagraph
```

Using npm:
```bash
npm i @sha1n/dagraph
```

Using yarn:
```bash
yarn add @sha1n/dagraph
```

## Development

This project uses [pnpm](https://pnpm.io/) for dependency management.

### Prerequisites
- Node.js (version specified in `.nvmrc` or `engines` in `package.json`)
- pnpm

### Commands

- **Install dependencies**:
  ```bash
  pnpm install
  ```

- **Build**:
  ```bash
  pnpm build
  ```

- **Run Tests**:
  ```bash
  pnpm test
  ```

- **Lint**:
  ```bash
  pnpm lint
  ```