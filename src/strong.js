// @flow

import { type Tomato, type TStep, lift, pipe } from './core'
import { end, skip, next, END, SKIP } from './step'

const dup = <A> (a: A): [A, A] => [a, a]
const fst = <A, B> (ab: [A, B]): A => ab[0]
const snd = <A, B> (ab: [A, B]): B => ab[1]

// Strong / Costrong
// Transformations on products (pairs)

export const split = <A> (): Tomato<A, [A, A]> =>
  lift(dup)

export const unsplit = <A, B, C> (f: (A, B) => C): Tomato<[A, B], C> =>
  lift(([a, b]) => f(a, b))

export const fanout = <A, B, C> (ab: Tomato<A, B>, ac: Tomato<A, C>): Tomato<A, [B, C]> =>
  pipe(split(), parallel(ab, ac))

export const lift2 = <A, B, C, D> (f: (B, C) => D, ab: Tomato<A, B>, ac: Tomato<A, C>): Tomato<A, D> =>
  pipe(fanout(ab, ac), unsplit(f))

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

export const unfirst = <A, B, C> (c: C, t: Tomato<[A, C], [B, C]>): Tomato<A, B> =>
  new Unfirst(c, t)

class Unfirst<A, B, C> {
  c: C
  t: Tomato<[A, C], [B, C]>
  constructor (c: C, t: Tomato<[A, C], [B, C]>) {
    this.c = c
    this.t = t
  }

  step (a: A): TStep<A, B> {
    const s = this.t.step([a, this.c])
    return s.type === END ? end()
      : s.type === SKIP ? skip(new Unfirst(this.c, s.state))
        : next(fst(s.value), new Unfirst(snd(s.value), s.state))
  }
}
