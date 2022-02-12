
# DAGraph
A direct acyclic graph implementation

- [DAGraph](#dagraph)
  - [Features](#features)
  - [Usage](#usage)
    - [Basic](#basic)
    - [Custom Objects](#custom-objects)
  - [Install](#install)

## Features
- Hosts your data in the graph structure
- Topological sort traversal generator
- Traverse root nodes generator
- Reverse graph API

## Usage

### Basic 

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

### Custom Objects
```ts

type MyThing = {
  id: string; // <-- implicitly implements the 'Identifiable' interface
  name: string;
  doSomething(): void;
};

const myThing = {
    id: 'a',
    name: 'my thing',
    doSomething: () => {
      console.log('A');
    }
  };

const myOtherThing = {
    id: 'b',
    name: 'my other thing',
    doSomething: () => {
      console.log('B');
    }
  };

const myDAG = createDAG<MyThing>();

myDAG.addEdge(myThing, myOtherThing);
```

## Install
```bash
yarn install @sha1n/dagraph
```

```bash
npm i @sha1n/dagraph
```