// @flow
import { type Tomato } from './tomato'

export const foldIterable = <A, R> (t: Tomato<[R, A], R>, r: R, i: Iterable<A>): R => {
  let s
  for (const a of i) {
    s = t.step([r, a])
    switch (s.type) {
      case 0:
        return r
      case 1:
        t = s.state
        break
      case 2:
        r = s.value
        t = s.state
        break
    }
  }
  return r
}
