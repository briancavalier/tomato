// @flow

import { type Step, end, next, skip, END, NEXT, SKIP } from './step'

export type TStep<A, B> = Step<B, Tomato<A, B>>

// An automaton that can be stepped to transform
// a value and returns an updated automaton
export type Tomato<A, B> = {
  step (A): TStep<A, B>
}

// Identity transform
export const id = <A> (): Tomato<A, A> =>
  new Id()

export class Id<A> {
  step (a: A): TStep<A, A> {
    return next(a, this)
  }
}

// Transform everything to a constant value
export const always = <X, A> (a: A): Tomato<X, A> =>
  new Const(a)

export class Const<A> {
  value: A
  constructor (value: A) {
    this.value = value
  }

  step <X> (x: X): TStep<X, A> {
    return next(this.value, this)
  }
}

// Lift a pure function into an automaton
export const lift = <A, B> (f: A => B): Tomato<A, B> =>
  new Lift(f)

export class Lift<A, B> {
  f: A => B
  constructor (f: A => B) {
    this.f = f
  }

  step (a: A): TStep<A, B> {
    return next(this.f(a), this)
  }
}

// Transform the input and output
export const promap = <A, B, C, D> (l: A => B, r: C => D, t: Tomato<B, C>): Tomato<A, D> =>
  lmap(l, rmap(r, t))

// Transform only the input
export const lmap = <A, B, C> (l: A => B, t: Tomato<B, C>): Tomato<A, C> =>
  pipe(lift(l), t)

// Transform only the output
export const rmap = <A, B, C> (r: B => C, t: Tomato<A, B>): Tomato<A, C> =>
  pipe(t, lift(r))

// Skip inputs for which a predicate is false
export const filter = <A> (p: A => boolean): Tomato<A, A> =>
  new Filter(p)

export class Filter<A> {
  p: A => boolean
  constructor (p: A => boolean) {
    this.p = p
  }

  step (a: A): TStep<A, A> {
    return this.p(a)
      ? next(a, this)
      : skip(this)
  }
}

// End after n steps
export const take = <A> (n: number): Tomato<A, A> =>
  new Take(n)

export class Take<A> {
  n: number
  constructor (n: number) {
    this.n = n
  }

  step (a: A): TStep<A, A> {
    return this.n > 0
      ? next(a, new Take(this.n - 1))
      : end()
  }
}

// Compose (left to right) two automatons
export const pipe = <A, B, C> (ab: Tomato<A, B>, bc: Tomato<B, C>): Tomato<A, C> =>
  new Pipe(ab, bc)

export class Pipe<A, B, C> {
  ab: Tomato<A, B>
  bc: Tomato<B, C>
  constructor (ab: Tomato<A, B>, bc: Tomato<B, C>) {
    this.ab = ab
    this.bc = bc
  }

  step (a: A): TStep<A, C> {
    const r = this.ab.step(a)
    switch (r.type) {
      case END: return end()
      case SKIP: return skip(new Pipe(r.state, this.bc))
    }

    const r2 = this.bc.step(r.value)
    switch (r2.type) {
      case END: return end()
      case SKIP: return skip(new Pipe(r.state, r2.state))
    }

    return next(r2.value, new Pipe(r.state, r2.state))
  }
}
