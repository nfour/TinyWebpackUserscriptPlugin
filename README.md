# Tiny Mobx State Tree Router

It's only [one file](./TinyMstRouter.ts). Based on [/alisd23/mst-react-router](https://github.com/alisd23/mst-react-router)

## Usage

```ts
import { TinyMstRouter } from 'tiny-mst-router';

const router = TinyMstRouter.create({})

router.push('/myroute')
```

## Install

Dont forget the peer dependencies.

`yarn add tiny-mst-router mobx mobx-state-tree`