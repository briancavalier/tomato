// @flow
import { type Tomato, type TStep } from './core'
import { END, NEXT, SKIP } from './step'
/* global Iterable */

// Transform an Iterable by stepping an automaton over
// all its items.  This fully materializes each step, and
// is useful as a building block.
// Most of the time, you probably want runIterable
export function * stepIterable <A, B> (t: Tomato<A, B>, ia: Iterable<A>): Iterable<TStep<A, B>> {
  let s
  let tom = t
  for (const a of ia) {
    s = tom.step(a)
    switch (s.type) {
      case END:
        yield s
        return
      default:
        yield s
        tom = s.next
        break
    }
  }
}

// Transform an Iterable by stepping an automaton over
// all its items
export function * runIterable <A, B> (t: Tomato<A, B>, ia: Iterable<A>): Iterable<B> {
  for (const s of stepIterable(t, ia)) {
    switch (s.type) {
      case END: return
      case SKIP: break
      default:
        yield s.value
        break
    }
  }
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
