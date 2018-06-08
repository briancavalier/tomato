# 🍅 Composable computations

Tomato is a library of composable, stateful, streaming computations that are data structure agnostic.

## Why?

Instead of learning a new, different API for each structure, use a single API to build computations that can be applied to any structure.

## How?

```js
import { filter, lift, take, to, runIterable } from '@briancavalier/tomato'

const add1 = x => x + 1
const isEven = x => x % 2 === 0

// Compose a computation that adds 1, and then keeps
// only 2 even results.
// Note that this computation is:
// 1. Streaming: it doesn't create an intermediate iterable
//    at each step
// 2. Efficient: it terminates after 2 even values without
//    needing to visit further items
// 3. Pure: even though take(2) is stateful, given the same
//    input it will produce the same output.
// 4. Reusable: because it's pure, it can be reused safely
//    on many iterables
const t = lift(add1)
  |> to(filter(isEven))
  |> to(take(2))

// We can apply it to any iterable.
// Let's start with an Array.
const a = [1, 2, 3, 4, 5, 6, 7, 8]

console.log(runIterable(t, a)) //> 2, 4

// Apply the same transformation to a Set
const s = new Set(a)

console.log(runIterable(t, s)) //> 2, 4

// Even to a generator
function * g () {
  for (const x of a) yield x
}

console.log(runIterable(t, g())) //> 2, 4
```
