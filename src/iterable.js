// @flow
import { type Tomato } from './tomato'
import { END, NEXT, SKIP } from './step'

// Fold an automaton over any Iterable
export const foldIterable = <A, R> (t: Tomato<[R, A], R>, r: R, i: Iterable<A>): R => {
  let s
  let result = r
  let tom = t
  for (const a of i) {
    s = tom.step([result, a])
    switch (s.type) {
      case END:
        return result
      case SKIP:
        tom = s.state
        break
      case NEXT:
        result = s.value
        tom = s.state
        break
    }
  }
  return result
}
