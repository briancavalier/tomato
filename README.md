# 🍅 Composable computations

Tomato is a library of composable, stateful, streaming computations that are data structure agnostic.

## Why?

Instead of learning a new, different API for each structure, use a single API to build computations that can be applied to any structure.

Computations are:

1. Composable: compose smaller computations into bigger ones.
1. Streaming: they run in constant space, i.e. they don't create intermediate structures at each step like Array map, filter, etc.
1. Pure: given the same input they will produce the same output.
1. Stateful: they can have internal state while remaining pure.
1. Reusable: because they're pure, a single computation can be reused safely on many structures.
1. Efficient: they can terminate early (e.g. `take`) without needing to visit further items.

## How?

```js
import { filter, lift, take, to, runIterable } from '@briancavalier/tomato'

const add1 = x => x + 1
const isEven = x => x % 2 === 0

// Compose a computation that adds 1, and then keeps
// only 2 even results.
const t = lift(add1)
  |> to(filter(isEven))
  |> to(take(2))

// We can apply it to any Iterable.
// Let's start with an Array.
const a = [1, 2, 3, 4, 5, 6, 7, 8]

// Stream the Array through the computation
for (const x of runIterable(t, a)) console.log(x) //> 2 4

// Apply the same transformation to a Set
const s = new Set([1, 2, 3, 4, 5, 6, 7, 8])

// Stream the Set
for (const x of runIterable(t, s)) console.log(x) //> 2 4

// Even to a generator
function * g () {
  yield * [1, 2, 3, 4, 5, 6, 7, 8]
}

// Stream the generator
for (const x of runIterable(t, g())) console.log(x) //> 2 4
```
