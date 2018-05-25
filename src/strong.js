// @flow

import { type Tomato, type TStep, lift, pipe } from './core'
import { end, skip, next, END, SKIP } from './step'

const dup = <A> (a: A): [A, A] => [a, a]
const fst = <A, B> (ab: [A, B]): A => ab[0]
const snd = <A, B> (ab: [A, B]): B => ab[1]

// Strong

export const split = <A> (): Tomato<A, [A, A]> =>
  lift(dup)

export const unsplit = <A, B, C> (f: (A, B) => C): Tomato<[A, B], C> =>
  lift(([a, b]) => f(a, b))

export const fanout = <A, B, C> (ab: Tomato<A, B>, ac: Tomato<A, C>): Tomato<A, [B, C]> =>
  pipe(split(), parallel(ab, ac))

export const parallel = <A, B, C, D> (ac: Tomato<A, C>, bd: Tomato<B, D>): Tomato<[A, B], [C, D]> =>
  new Parallel(ac, bd)

export class Parallel<A, B, C, D> {
  ac: Tomato<A, C>
  bd: Tomato<B, D>
  constructor (ac: Tomato<A, C>, bd: Tomato<B, D>) {
    this.ac = ac
    this.bd = bd
  }

  step (ab: [A, B]): TStep<[A, B], [C, D]> {
    const s0 = this.ac.step(fst(ab))
    const s1 = this.bd.step(snd(ab))
    return s0.type === END || s1.type === END ? end()
      : s0.type === SKIP || s1.type === SKIP ? skip(new Parallel(s0.state, s1.state))
        : next([s0.value, s1.value], new Parallel(s0.state, s1.state))
  }
}

export const first = <A, B, C> (ab: Tomato<A, B>): Tomato<[A, C], [B, C]> =>
  new First(ab)

class First<A, B, C> {
  ab: Tomato<A, B>
  constructor (ab: Tomato<A, B>) {
    this.ab = ab
  }

  step (ac: [A, C]): TStep<[A, C], [B, C]> {
    const s = this.ab.step(fst(ac))
    return s.type === END ? end()
      : s.type === SKIP ? skip(new First(s.state))
        : next([s.value, snd(ac)], new First(s.state))
  }
}

// Costrong

export const unfirst = <A, B, C> (t: Tomato<[A, C], [B, C]>, c: C): Tomato<A, B> =>
  new Unfirst(t, c)

class Unfirst<A, B, C> {
  t: Tomato<[A, C], [B, C]>
  c: C
  constructor (t: Tomato<[A, C], [B, C]>, c: C) {
    this.t = t
    this.c = c
  }

  step (a: A): TStep<A, B> {
    const s = this.t.step([a, this.c])
    return s.type === END ? end()
      : s.type === SKIP ? skip(new Unfirst(s.state, this.c))
        : next(fst(s.value), new Unfirst(s.state, snd(s.value)))
  }
}
