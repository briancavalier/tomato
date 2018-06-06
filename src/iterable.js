// @flow
import { type Tomato } from './core'
import { END, NEXT, SKIP } from './step'
/* global Iterable */

// Transform an Iterable by stepping an automaton over
// all its items
export const runIterable = <A, B> (t: Tomato<A, B>, ia: Iterable<A>): B[] => {
  let s
  let b = []
  let tom = t
  for (const a of ia) {
    s = tom.step(a)
    switch (s.type) {
      case END:
        return b
      case SKIP:
        tom = s.next
        break
      case NEXT:
        b.push(s.value)
        tom = s.next
        break
    }
  }
  return b
}

// Fold an automaton over any Iterable
export const foldIterable = <A, R> (t: Tomato<[R, A], R>, r: R, ia: Iterable<A>): R => {
  let s
  let result = r
  let tom = t
  for (const a of ia) {
    s = tom.step([result, a])
    switch (s.type) {
      case END:
        return result
      case SKIP:
        tom = s.next
        break
      case NEXT:
        result = s.value
        tom = s.next
        break
    }
  }
  return result
}
